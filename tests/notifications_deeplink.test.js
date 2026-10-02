import test from 'node:test';
import assert from 'node:assert/strict';

import { NotificationService } from '../shared/dist/services/notificationService.js';
import { parseDeepLink, generateDeepLink } from '../shared/dist/utils/deepLink.js';

test('Push Notification Dispatch & Deep Link Routing Engine Tests', async (t) => {
  await t.test('1. Admin Dispatches Push Broadcast Campaign to Students Only', () => {
    let subscriberFired = false;
    let receivedNotif = null;

    const unsubscribe = NotificationService.subscribe((notif) => {
      subscriberFired = true;
      receivedNotif = notif;
    });

    const campaign = NotificationService.createCampaignPayload(
      '🚀 50+ Top Tech Companies Hiring!',
      'Exclusive campus drives for React Native & AI engineers are now active.',
      'student_app',
      { uid: 'admin_superuser_01', name: 'Platform Superuser' },
      {
        category: 'jobs',
        deepLink: 'gotechplace://student/jobs',
      }
    );

    assert.ok(campaign.id);
    assert.equal(campaign.status, 'sent');
    assert.equal(subscriberFired, true);
    assert.equal(receivedNotif?.title, '🚀 50+ Top Tech Companies Hiring!');

    // Verify Student inbox receives the notification
    const studentNotifs = NotificationService.getNotificationsForUser('usr_student_himanshu', 'student');
    const matched = studentNotifs.find((n) => n.title.includes('50+ Top Tech Companies Hiring'));
    assert.ok(matched, 'Student inbox must receive targeted campaign');
    assert.equal(matched.category, 'jobs');
    assert.equal(matched.deepLink, 'gotechplace://student/jobs');

    // Verify Client inbox does NOT receive student-only campaign
    const clientNotifs = NotificationService.getNotificationsForUser('usr_client_demo', 'client');
    const clientMatched = clientNotifs.find((n) => n.title.includes('50+ Top Tech Companies Hiring'));
    assert.equal(clientMatched, undefined, 'Client inbox must not receive student-only broadcast');

    unsubscribe();
  });

  await t.test('2. Admin Dispatches Push Broadcast Campaign to Employers / Clients Only', () => {
    const campaign = NotificationService.createCampaignPayload(
      '🏢 New Candidate Talent Pool Live',
      'Over 200+ verified engineering graduates available for immediate interview.',
      'client_app',
      { uid: 'admin_superuser_01', name: 'Platform Superuser' },
      {
        category: 'applications',
        deepLink: 'gotechplace://client/applications',
      }
    );

    assert.ok(campaign.id);

    // Verify Client inbox receives the notification
    const clientNotifs = NotificationService.getNotificationsForUser('usr_client_demo', 'client');
    const matched = clientNotifs.find((n) => n.title.includes('New Candidate Talent Pool Live'));
    assert.ok(matched, 'Client inbox must receive client campaign');
    assert.equal(matched.deepLink, 'gotechplace://client/applications');

    // Verify Student inbox does not receive client-only campaign
    const studentNotifs = NotificationService.getNotificationsForUser('usr_student_himanshu', 'student');
    const studentMatched = studentNotifs.find((n) => n.title.includes('New Candidate Talent Pool Live'));
    assert.equal(studentMatched, undefined);
  });

  await t.test('3. Universal Broadcast to All Apps and Users', () => {
    const campaign = NotificationService.createCampaignPayload(
      '📢 Scheduled Platform Maintenance Notice',
      'GoTechPlace services will undergo a 15-minute optimization window tonight.',
      'all_apps',
      { uid: 'admin_superuser_01', name: 'Platform Superuser' },
      {
        category: 'system',
        deepLink: 'gotechplace://student/dashboard',
      }
    );

    assert.ok(campaign.id);

    // Both student, client, and admin receive all_apps broadcasts
    const studentNotifs = NotificationService.getNotificationsForUser('usr_student_himanshu', 'student');
    assert.ok(studentNotifs.some((n) => n.title.includes('Platform Maintenance Notice')));

    const clientNotifs = NotificationService.getNotificationsForUser('usr_client_demo', 'client');
    assert.ok(clientNotifs.some((n) => n.title.includes('Platform Maintenance Notice')));

    const adminNotifs = NotificationService.getNotificationsForUser('usr_admin_root', 'admin');
    assert.ok(adminNotifs.some((n) => n.title.includes('Platform Maintenance Notice')));
  });

  await t.test('4. Automated System Notification Lifecycle Events Dispatching', () => {
    // A: Job Approved
    const jobNotif = NotificationService.generateAutomaticNotification('JOB_APPROVED', {
      recipientUid: 'usr_client_demo',
      jobId: 'job-101',
      jobTitle: 'Junior React Native Android Developer',
    });
    assert.ok(jobNotif.id);
    assert.equal(jobNotif.userId, 'usr_client_demo');
    assert.equal(jobNotif.deepLink, 'gotechplace://client/jobs/job-101');

    // B: Application Status Changed
    const appNotif = NotificationService.generateAutomaticNotification('APPLICATION_STATUS_CHANGED', {
      recipientUid: 'usr_student_himanshu',
      jobTitle: 'Junior React Native Android Developer',
      companyName: 'Nexus Innovations Ltd',
      status: 'Shortlisted',
    });
    assert.ok(appNotif.id);
    assert.equal(appNotif.userId, 'usr_student_himanshu');
    assert.equal(appNotif.deepLink, 'gotechplace://student/applications');
  });

  await t.test('5. Deep Link URI Parsing Engine - Student App Routes', () => {
    // Job detail route
    const jobLink = parseDeepLink('gotechplace://student/jobs/job-101');
    assert.deepEqual(jobLink, {
      app: 'student',
      screen: 'jobs',
      params: { id: 'job-101' },
    });

    // Course detail route
    const courseLink = parseDeepLink('gotechplace://student/courses/course-1');
    assert.deepEqual(courseLink, {
      app: 'student',
      screen: 'courses',
      params: { id: 'course-1' },
    });

    // Project detail route
    const projectLink = parseDeepLink('gotechplace://student/projects/proj-1');
    assert.deepEqual(projectLink, {
      app: 'student',
      screen: 'projects',
      params: { id: 'proj-1' },
    });

    // Applications route
    const appLink = parseDeepLink('gotechplace://student/applications');
    assert.deepEqual(appLink, {
      app: 'student',
      screen: 'applications',
      params: {},
    });

    // Universal Web link format
    const webLink = parseDeepLink('https://gotechplace.com/student/jobs/job-101');
    assert.deepEqual(webLink, {
      app: 'student',
      screen: 'jobs',
      params: { id: 'job-101' },
    });
  });

  await t.test('6. Deep Link URI Parsing Engine - Client App Routes', () => {
    const createJobLink = parseDeepLink('gotechplace://client/create-job');
    assert.deepEqual(createJobLink, {
      app: 'client',
      screen: 'create-job',
      params: {},
    });

    const clientJobLink = parseDeepLink('gotechplace://client/jobs/job-101');
    assert.deepEqual(clientJobLink, {
      app: 'client',
      screen: 'jobs',
      params: { id: 'job-101' },
    });

    const candidatesLink = parseDeepLink('gotechplace://client/applications?jobId=job-101');
    assert.deepEqual(candidatesLink, {
      app: 'client',
      screen: 'applications',
      params: { jobId: 'job-101' },
    });
  });

  await t.test('7. Deep Link URI Parsing Engine - Admin App Routes', () => {
    const clientApprovals = parseDeepLink('gotechplace://admin/clientApprovals');
    assert.deepEqual(clientApprovals, {
      app: 'admin',
      screen: 'clientapprovals',
      params: {},
    });

    const userInspect = parseDeepLink('gotechplace://admin/users/usr_student_himanshu');
    assert.deepEqual(userInspect, {
      app: 'admin',
      screen: 'users',
      params: { id: 'usr_student_himanshu' },
    });

    const broadcastLink = parseDeepLink('gotechplace://admin/notifications');
    assert.deepEqual(broadcastLink, {
      app: 'admin',
      screen: 'notifications',
      params: {},
    });
  });

  await t.test('8. Deep Link Generator Utility', () => {
    const studentUrl = generateDeepLink('student', 'jobs', { id: 'job-101', ref: 'notification' });
    assert.equal(studentUrl, 'gotechplace://student/jobs?id=job-101&ref=notification');

    const clientUrl = generateDeepLink('client', 'applications', { jobId: 'job-101' });
    assert.equal(clientUrl, 'gotechplace://client/applications?jobId=job-101');
  });
});
