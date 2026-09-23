import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

/**
 * 1. User Created Trigger
 * Sets default claims and creates profile
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const phoneNumber = user.phoneNumber || '';

  const userDocRef = db.collection('users').doc(uid);
  const userDoc = await userDocRef.get();

  if (!userDoc.exists) {
    const role = 'student'; // default role
    await userDocRef.set({
      uid,
      phoneNumber,
      name: '',
      role,
      status: 'active',
      isApproved: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Set custom claims for secure token-based authorization
    await admin.auth().setCustomUserClaims(uid, { role });
  }
});

/**
 * 2. Job Approval Trigger
 * When a job is approved or rejected by an admin, notify the client and broadcast to students
 */
export const onJobStatusChanged = functions.firestore
  .document('jobs/{jobId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const jobId = context.params.jobId;

    // Status changed to approved
    if (before.approvalStatus !== 'approved' && after.approvalStatus === 'approved') {
      // 1. Notify the client
      const clientNotification = {
        userId: after.clientId,
        title: '🎉 Job Approved!',
        body: `Your job posting "${after.title}" has been approved and is now live on TECH2PLACE.`,
        deepLink: `tech2place://client/jobs/${jobId}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await db.collection('notifications').add(clientNotification);

      // Send push to client devices
      const clientDevicesSnap = await db.collection('users').doc(after.clientId).collection('devices').get();
      const tokens: string[] = [];
      clientDevicesSnap.forEach((doc) => {
        const data = doc.data();
        if (data.token && data.enabled) tokens.push(data.token);
      });

      if (tokens.length > 0) {
        await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title: clientNotification.title,
            body: clientNotification.body,
          },
          data: {
            deepLink: clientNotification.deepLink,
          },
        });
      }

      // 2. Broadcast to student topic
      await messaging.send({
        topic: 'student_app',
        notification: {
          title: '💼 New Job Opening Available!',
          body: `${after.title} (${after.category}) - Apply now on TECH2PLACE`,
        },
        data: {
          deepLink: `tech2place://student/job/${jobId}`,
        },
      });

      // 3. Log audit event
      await db.collection('auditLogs').add({
        action: 'APPROVE_JOB',
        targetId: jobId,
        targetType: 'job',
        adminId: after.approvedBy || 'system',
        adminName: 'Admin',
        timestamp: new Date().toISOString(),
        metadata: { title: after.title, clientId: after.clientId },
      });
    }

    // Status changed to rejected
    if (before.approvalStatus !== 'rejected' && after.approvalStatus === 'rejected') {
      const clientNotification = {
        userId: after.clientId,
        title: '⚠️ Job Posting Needs Revision',
        body: `Your job "${after.title}" was not approved. Reason: ${after.rejectionReason || 'Requires updates'}`,
        deepLink: `tech2place://client/jobs/${jobId}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await db.collection('notifications').add(clientNotification);
    }
  });

/**
 * 3. Client Approval Trigger
 * When an admin approves or rejects a client profile
 */
export const onClientApproved = functions.firestore
  .document('clients/{clientId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const clientId = context.params.clientId;

    if (before.approvalStatus !== 'approved' && after.approvalStatus === 'approved') {
      // Update user doc isApproved
      await db.collection('users').doc(clientId).update({
        isApproved: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send notification
      const notif = {
        userId: clientId,
        title: '🎊 Client Account Approved!',
        body: 'Welcome to TECH2PLACE! Your company profile is verified and you can now post jobs.',
        deepLink: 'tech2place://client/create-job',
        read: false,
        createdAt: new Date().toISOString(),
      };
      await db.collection('notifications').add(notif);

      // Audit log
      await db.collection('auditLogs').add({
        action: 'APPROVE_CLIENT',
        targetId: clientId,
        targetType: 'client',
        adminId: after.approvedBy || 'system',
        adminName: 'Admin',
        timestamp: new Date().toISOString(),
        metadata: { companyName: after.companyName },
      });
    }
  });

/**
 * 4. Privileged Push Notification Callable Function
 * Validates admin permissions before broadcasting notifications
 */
export const sendPushNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerUid = context.auth.uid;
  const userDoc = await db.collection('users').doc(callerUid).get();
  const userData = userDoc.data();

  const allowedRoles = ['superuser', 'admin', 'staff'];
  if (!userData || !allowedRoles.includes(userData.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized to send notifications');
  }

  const { title, message, target, imageUrl, deepLink, targetUserIds } = data;

  if (!title || !message || !target) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  let recipientCount = 0;

  // Topic-based broadcast
  if (['all_users', 'student_app', 'client_app', 'admin_app'].includes(target)) {
    await messaging.send({
      topic: target,
      notification: {
        title,
        body: message,
        imageUrl: imageUrl || undefined,
      },
      data: {
        deepLink: deepLink || '',
      },
    });
    recipientCount = 1000; // estimated topic subscriber count
  } else if (target === 'individual' && targetUserIds && targetUserIds.length > 0) {
    // Send to specific users
    for (const uid of targetUserIds) {
      const devicesSnap = await db.collection('users').doc(uid).collection('devices').get();
      const tokens: string[] = [];
      devicesSnap.forEach((doc) => {
        const d = doc.data();
        if (d.token && d.enabled) tokens.push(d.token);
      });

      if (tokens.length > 0) {
        await messaging.sendEachForMulticast({
          tokens,
          notification: { title, body: message, imageUrl: imageUrl || undefined },
          data: { deepLink: deepLink || '' },
        });
        recipientCount += tokens.length;
      }
    }
  }

  // Record notification campaign in Firestore
  const campaignRef = await db.collection('notificationCampaigns').add({
    title,
    message,
    target,
    imageUrl: imageUrl || null,
    deepLink: deepLink || null,
    sentBy: callerUid,
    sentByName: userData.name || 'Admin',
    status: 'sent',
    recipientCount,
    createdAt: new Date().toISOString(),
  });

  // Audit log
  await db.collection('auditLogs').add({
    action: 'SEND_NOTIFICATION',
    targetId: campaignRef.id,
    targetType: 'notification',
    adminId: callerUid,
    adminName: userData.name || 'Admin',
    timestamp: new Date().toISOString(),
    metadata: { title, target },
  });

  return { success: true, campaignId: campaignRef.id, recipientCount };
});

/**
 * 5. Scheduled Notifications Processor (CRON)
 * Runs periodically to deliver pending scheduled campaigns
 */
export const processScheduledNotifications = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const now = new Date().toISOString();
    const pendingSnap = await db
      .collection('notificationCampaigns')
      .where('status', '==', 'scheduled')
      .where('scheduledFor', '<=', now)
      .get();

    for (const doc of pendingSnap.docs) {
      const campaign = doc.data();
      try {
        if (campaign.target) {
          await messaging.send({
            topic: campaign.target,
            notification: {
              title: campaign.title,
              body: campaign.message,
              imageUrl: campaign.imageUrl || undefined,
            },
            data: {
              deepLink: campaign.deepLink || '',
            },
          });
        }
        await doc.ref.update({
          status: 'sent',
          sentAt: now,
        });
      } catch (err) {
        console.error('Failed to send scheduled campaign', doc.id, err);
        await doc.ref.update({ status: 'failed' });
      }
    }
  });
