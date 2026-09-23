# TECH2PLACE — Firebase Production Connection & Database Setup Guide

This guide provides end-to-end instructions for connecting the **TECH2PLACE** mobile ecosystem (**Student App**, **Client App**, **Admin Console**, and **Shared Library**) to a live production **Google Firebase** backend.

---

## Architecture Overview

```
                                ┌─────────────────────────────────────────┐
                                │      Firebase Production Platform       │
                                │         (Project: tech2place-prod)       │
                                └────────────────────┬────────────────────┘
                                                     │
             ┌───────────────────────────────────────┼───────────────────────────────────────┐
             ▼                                       ▼                                       ▼
┌──────────────────────────┐            ┌──────────────────────────┐            ┌──────────────────────────┐
│       Student App        │            │        Client App        │            │       Admin App          │
│ (com.tech2place.student) │            │  (com.tech2place.client) │            │  (com.tech2place.admin)  │
└────────────┬─────────────┘            └────────────┬─────────────┘            └────────────┬─────────────┘
             │                                       │                                       │
             │ SHA-1 / SHA-256                       │ SHA-1 / SHA-256                       │ SHA-1 / SHA-256
             │ google-services.json                  │ google-services.json                  │ google-services.json
             ▼                                       ▼                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Firebase Core Services Layer                                             │
│                                                                                                          │
│  • Firebase Authentication: Phone SMS Auth with Play Integrity & Test Credentials                        │
│  • Cloud Firestore: Multi-tenant database with strict RBAC rules & compound query indexes                │
│  • Cloud Storage: Secure buckets for user avatars, resumes (PDF/DOCX), and project attachments          │
│  • Cloud Functions (Node.js/TypeScript): Async triggers, status notifications, and RBAC Custom Claims    │
│  • Firebase Cloud Messaging (FCM v1): Automated topic subscriptions and targeted push broadcasts        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Firebase Project & Billing Setup

### 1.1 Create the Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project**.
3. Enter Project Name: `tech2place-prod` (or your preferred organization slug).
4. **Google Analytics**: Enable Google Analytics (recommended for crash analytics, conversion events, and user engagement tracking). Choose or create an Analytics account.
5. Click **Create Project**.

### 1.2 Upgrade to Blaze Plan (Pay as You Go)
> **Crucial Requirement**: The Blaze Plan is required to:
> - Send SMS verification codes for Phone Authentication beyond free tier limits.
> - Run Cloud Functions for push notifications and automated client/job moderation triggers.
> - Call external APIs (e.g. Google Cloud Play Integrity).

1. In the bottom-left corner of the Firebase Console, click **Upgrade**.
2. Select the **Blaze (Pay as you go)** plan.
3. Link your Google Cloud Billing Account.
4. Set a monthly budget alert (e.g., $25 or ₹2,000) under **Billing > Budgets & Alerts** to prevent unexpected overages.

### 1.3 Choose Database Region
When enabling Firestore (Phase 3), select a region closest to your target audience.
* **Recommended for India**: `asia-south1` (Mumbai).
* **Multi-region option**: `nam5` (United States) or `eur3` (Europe) if serving global clients.

---

## Phase 2: Register All 3 Android Apps & Obtain `google-services.json`

Because TECH2PLACE operates three distinct mobile applications with separate package names, you must register **three Android apps** within the **same Firebase project**.

### 2.1 Retrieve Android Keystore Fingerprints (SHA-1 & SHA-256)

Both Phone Authentication (SMS auto-retrieval) and Firebase App Check/Play Integrity require your app's certificate fingerprints.

#### Debug Keystore Fingerprint:
Run the following in your terminal:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
*Note the `SHA1:` and `SHA256:` values.*

#### Production Release Keystore Fingerprint:
If you have created a production release keystore:
```bash
keytool -list -v -keystore /path/to/tech2place-release.keystore -alias tech2place_alias
```

---

### 2.2 Register Apps in Firebase Console

Navigate to **Project Settings > General > Your Apps > Add app (Android icon)**:

#### 1. Student App
- **Android package name**: `com.tech2place.student`
- **App nickname**: `Tech2Place Student`
- **Debug SHA-1**: Paste debug SHA-1
- Click **Register App**.
- Under **SHA certificate fingerprints**, click **Add fingerprint** and add the SHA-256.
- Download `google-services.json`.
- Place file at:
  ```text
  career-hub/student/android/app/google-services.json
  ```

#### 2. Client / Employer App
- Click **Add app > Android**.
- **Android package name**: `com.tech2place.client`
- **App nickname**: `Tech2Place Client`
- **Debug SHA-1**: Paste debug SHA-1
- Click **Register App**. Add SHA-256 fingerprint.
- Download `google-services.json`.
- Place file at:
  ```text
  career-hub/client/android/app/google-services.json
  ```

#### 3. Admin App
- Click **Add app > Android**.
- **Android package name**: `com.tech2place.admin`
- **App nickname**: `Tech2Place Admin`
- **Debug SHA-1**: Paste debug SHA-1
- Click **Register App**. Add SHA-256 fingerprint.
- Download `google-services.json`.
- Place file at:
  ```text
  career-hub/admin/android/app/google-services.json
  ```

---

## Phase 3: Firebase Authentication (Phone SMS Auth)

### 3.1 Enable Phone Sign-in Provider
1. Go to **Authentication > Sign-in method**.
2. Click **Phone** under Native providers.
3. Toggle **Enable**.

### 3.2 Configure Test Phone Numbers (Bypass SMS Charges in Staging & Review)
Under the Phone configuration modal:
1. Expand **Phone numbers for testing (optional)**.
2. Add the test numbers configured across the apps:
   - Phone: `+91 99999 88888` | Test Code: `123456` (Superuser / Admin Console)
   - Phone: `+91 98765 43210` | Test Code: `123456` (Student Candidate)
   - Phone: `+91 98123 45678` | Test Code: `123456` (Employer Client)
3. Click **Save**.

### 3.3 Configure Play Integrity & SafetyNet (Android)
To prevent SMS spoofing and abuse:
1. Go to **Authentication > Settings > SMS Multi-Factor and reCAPTCHA**.
2. Ensure **Play Integrity API** is enabled in the Google Cloud Console for project `tech2place-prod`.
3. Link your Google Play Developer Console account if published to Google Play.

---

## Phase 4: Cloud Firestore Database Setup

### 4.1 Create Firestore Database
1. Go to **Firestore Database** in Firebase Console.
2. Click **Create Database**.
3. Select **Production mode** (Security rules will lock access initially).
4. Choose location: `asia-south1` (Mumbai).
5. Click **Enable**.

---

### 4.2 Deploy Production Security Rules

The workspace includes production-tested security rules in [`firebase/firestore.rules`](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/firebase/firestore.rules). These enforce strict RBAC, validate field immutability, prevent clients from modifying approval statuses, and restrict administrative controls to verified staff.

#### Rule Verification Highlights:
- **`users`**: Students & Clients can update their profile information, but cannot self-assign `role`, `isApproved`, or `status`.
- **`jobs`**: Clients can only post and update their own draft jobs; only users with `jobs.approve` permission can mark jobs as approved.
- **`applications`**: Students can create job applications; only the posting Client or Admins can review candidates and update application statuses (`accepted`, `rejected`, `shortlisted`).
- **`app_versions`**: Read-accessible by all apps for the Force Update Gate; write-protected exclusively for Admins.

#### Deploy with Firebase CLI:
```bash
# 1. Install or update firebase-tools
npm install -g firebase-tools

# 2. Authenticate
firebase login

# 3. Select active project
cd /Users/sudhir/Documents/Projects/7CareerHub/career-hub/firebase
firebase use --add tech2place-prod

# 4. Deploy rules
firebase deploy --only firestore:rules
```

---

### 4.3 Deploy Firestore Composite Indexes

Certain complex filters across the applications (e.g. filtering jobs by status and creation date, or fetching unread user alerts) require composite indexes. These are defined in [`firebase/firestore.indexes.json`](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/firebase/firestore.indexes.json).

#### Deploy Indexes:
```bash
firebase deploy --only firestore:indexes
```

#### Monitored Indexes Included:
1. `jobs`: `status (ASC)` + `approvalStatus (ASC)` + `createdAt (DESC)`
2. `applications`: `jobId (ASC)` + `status (ASC)` + `createdAt (DESC)`
3. `notifications`: `userId (ASC)` + `read (ASC)` + `createdAt (DESC)`
4. `audit_logs`: `targetType (ASC)` + `timestamp (DESC)`

---

## Phase 5: Cloud Storage Setup

### 5.1 Create Default Bucket
1. Go to **Storage** in Firebase Console.
2. Click **Get Started**.
3. Select **Production mode**.
4. Choose the same region as Firestore (`asia-south1`).

### 5.2 Deploy Storage Rules
The rules in [`firebase/storage.rules`](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/firebase/storage.rules) enforce file type and size constraints:
- User avatars: Max 5 MB, `image/*` only.
- Resumes & Job attachments: Max 10 MB, PDF, DOCX, or Images.

```bash
firebase deploy --only storage
```

---

## Phase 6: Cloud Functions & FCM Push Notification Service

Cloud Functions automate server-side tasks like dispatching push notifications when clients post jobs, when admins approve accounts, or when broadcast campaigns are launched.

### 6.1 Initialize & Deploy Cloud Functions
```bash
cd /Users/sudhir/Documents/Projects/7CareerHub/career-hub/firebase/functions
npm install
npm run build
firebase deploy --only functions
```

### 6.2 Key Triggers in `firebase/functions`:
1. **`onJobCreated`**: Detects a new job submission $\rightarrow$ creates in-app alerts for all active moderators and admins.
2. **`onJobApproved`**: Sends high-priority FCM push notification to the `all_students` topic.
3. **`onClientApproved`**: Notifies the employer that their verification succeeded and they can now publish positions.
4. **`onApplicationStatusChanged`**: Sends push notification directly to the applicant's device when shortlisted or accepted.
5. **`setUserCustomClaims`**: Callable HTTPS function for Superusers to set Auth token claims (`token.role = 'admin'`), allowing instantaneous rule execution without Firestore read penalties.

---

## Phase 7: React Native SDK Wiring & Native Linking

Currently, the services in `studentService.ts`, `clientService.ts`, and `adminService.ts` provide in-memory implementations. To link directly to live Firestore and Firebase Auth:

### 7.1 Install Official React Native Firebase Packages
From the root of the workspace:
```bash
npm install --save @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/messaging
```

### 7.2 Native Android Integration Check

Confirm the following configuration in each app's `android` folder:

1. **`android/build.gradle` (Project Level)**:
   ```gradle
   buildscript {
       dependencies {
           classpath("com.google.gms:google-services:4.4.2")
       }
   }
   ```
2. **`android/app/build.gradle` (App Level)**:
   ```gradle
   apply plugin: "com.google.gms.google-services"
   ```

*(Already configured in `student`, `client`, and `admin`).*

---

### 7.3 Connect Services to Live Firestore

Replace the local state managers in [`shared/services/authService.ts`](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/shared/services/authService.ts) and the app services with React Native Firebase calls:

#### Example: Live Phone Authentication
```typescript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const AuthService = {
  async sendOtp(phoneNumber: string) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return { success: true, verificationId: confirmation.verificationId };
  },

  async verifyOtp(confirmation: any, code: string, role: UserRole) {
    const userCredential = await confirmation.confirm(code);
    const uid = userCredential.user.uid;

    const userDoc = await firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      // First-time registration
      const newUser = {
        uid,
        phoneNumber: userCredential.user.phoneNumber,
        role,
        status: 'active',
        isApproved: role === 'student',
        createdAt: firestore.FieldValue.serverTimestamp(),
      };
      await firestore().collection('users').doc(uid).set(newUser);
      return { success: true, user: newUser };
    }
    return { success: true, user: userDoc.data() };
  }
};
```

#### Example: Real-Time Jobs Listener (`StudentService`)
```typescript
import firestore from '@react-native-firebase/firestore';

export function subscribeToApprovedJobs(callback: (jobs: Job[]) => void) {
  return firestore()
    .collection('jobs')
    .where('approvalStatus', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const liveJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      callback(liveJobs);
    });
}
```

---

## Phase 8: Production Readiness Checklist

Before publishing APKs / AABs to Google Play or deploying to production users, verify the following:

- [ ] **Blaze Billing Account Linked**: Prevents service interruption from SMS quota limits.
- [ ] **All 3 Apps Registered in Same Project**: `com.tech2place.student`, `com.tech2place.client`, and `com.tech2place.admin`.
- [ ] **Release SHA-1 and SHA-256 Certificates Added**: Ensure both Google Play App Signing key and upload key fingerprints are added to Firebase Console under each app.
- [ ] **`google-services.json` Placed in App Directories**: Downloaded fresh after adding fingerprints and saved to `app/google-services.json` in all three projects.
- [ ] **Firestore Rules Deployed**: Verify `firebase deploy --only firestore:rules` completed without syntax errors.
- [ ] **Storage Rules Deployed**: Verify `firebase deploy --only storage` completed.
- [ ] **Test Numbers Tested on Physical Device**: Test SMS code `123456` with `+91 99999 88888` on physical device `RZ8M83Q8C4Y`.
- [ ] **Default App Versions Initialized**: Create initial documents in collection `app_versions`:
  - `app_versions/student` $\rightarrow$ `{ latestVersion: "1.0.0", minimumVersion: "1.0.0", updateMode: "optional", maintenance: false }`
  - `app_versions/client` $\rightarrow$ `{ latestVersion: "1.0.0", minimumVersion: "1.0.0", updateMode: "optional", maintenance: false }`
  - `app_versions/admin` $\rightarrow$ `{ latestVersion: "1.0.0", minimumVersion: "1.0.0", updateMode: "optional", maintenance: false }`
- [ ] **FCM Server Key Configured**: Securely save Firebase service account credentials in CI/CD or Cloud Functions environment variables.
