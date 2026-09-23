# TECH2PLACE Firebase Architecture & Governance

This document describes the Cloud Firestore data model, security rules, Cloud Functions, and Firebase Storage specifications for TECH2PLACE.

---

## 1. Firestore Data Collections

| Collection Path | Description | Access Policy |
|:---|:---|:---|
| `/users/{uid}` | Core user credentials, roles, and status | Self read/write; Admin read/write; Blocked if suspended |
| `/clients/{uid}` | Detailed company profiles and verification status | Client read/write; Admin read/write |
| `/students/{uid}` | Academic profile, branch, year, resume URL | Student read/write; Admin read/write |
| `/jobs/{jobId}` | Client job postings | Public read for `approved`; Client manages own; Admin full control |
| `/applications/{appId}` | Student job applications | Applicant & Employer read/write; Admin read |
| `/projects/{projectId}` | Minor & Major academic project templates | Authenticated read; Admin manage |
| `/courses/{courseId}` | Technical training modules | Authenticated read; Admin manage |
| `/notifications/{notifId}` | Direct user push & in-app alerts | Recipient read/write; Admin write |
| `/app_versions/{appId}` | Version configurations & maintenance flags | Public read; Admin write only |
| `/audit_logs/{logId}` | Immutable administrative activity logs | Admin read only; Strictly append-only (no update/delete) |
| `/system_settings/{id}` | Ecosystem governance flags & contact coordinates | Public read; Admin write only |

---

## 2. Security Rules Architecture (`firestore.rules`)

The security model is defined in `firebase/firestore.rules`. Key constraints:

1. **Self-Approval Prevention**:
   ```javascript
   // Clients cannot update their own approvalStatus
   allow update: if isOwner(uid) && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['approvalStatus', 'approvedAt', 'approvedBy']));
   ```

2. **Job Moderation Protection**:
   ```javascript
   // Only admin/superuser can change approvalStatus to 'approved'
   allow update: if isClient() && resource.data.clientId == request.auth.uid &&
                 (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['approvalStatus', 'approvedBy', 'approvedAt']));
   ```

3. **Immutable Audit Logs**:
   ```javascript
   match /audit_logs/{logId} {
     allow read: if isAdmin();
     allow create: if isAdmin();
     allow update, delete: if false; // STRICTLY IMMUTABLE
   }
   ```

4. **Account Suspension Enforcement**:
   All read and write rules verify that `getUser().status != 'suspended'`.

---

## 3. Storage Rules (`storage.rules`)

Storage limits are strictly enforced at the bucket level:
* **Profile Avatars** (`/avatars/{uid}/*`):
  * Maximum size: **5 MB**
  * Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
* **Job Attachments** (`/job_attachments/{jobId}/*`):
  * Maximum size: **10 MB**
  * Allowed MIME types: Images, PDFs (`application/pdf`)
* **Student Resumes** (`/resumes/{uid}/*`):
  * Maximum size: **10 MB**
  * Allowed MIME types: `application/pdf`

---

## 4. Firebase Cloud Functions (`firebase/functions/`)

Implemented in TypeScript:

1. `onUserCreated`:
   * Automatically sets default role claim (`student` or `client`).
   * Creates initial profile document skeleton.

2. `onClientApproved`:
   * Triggers when Admin marks a client profile as `approved`.
   * Sends automated FCM push notification and email confirmation to the employer.

3. `onJobStatusChanged`:
   * Triggers when Admin approves a job posting.
   * Broadcasts FCM notification to topic `student_announcements` announcing the new listing.

4. `sendPushNotification`:
   * Secure callable Cloud Function validating Admin session before dispatching FCM messages.

---

## 5. Composite Indexes (`firestore.indexes.json`)

Compound indexes configured for production query performance:
* `jobs`: `approvalStatus (ASC)` + `createdAt (DESC)`
* `jobs`: `category (ASC)` + `approvalStatus (ASC)` + `budget (DESC)`
* `applications`: `jobId (ASC)` + `status (ASC)` + `createdAt (DESC)`
* `applications`: `studentId (ASC)` + `createdAt (DESC)`
* `notifications`: `recipientId (ASC)` + `createdAt (DESC)`
* `audit_logs`: `targetType (ASC)` + `timestamp (DESC)`
