# TECH2PLACE Administrator Manual

This guide provides step-by-step instructions for operators, moderators, and system administrators managing the TECH2PLACE ecosystem.

---

## 1. Accessing the Admin Console

The administrative console is protected by multi-layered security gates:
* Accessible via the dedicated native application: `com.tech2place.admin`.
* Only accounts with roles `moderator`, `admin`, or `superuser` can authenticate.
* Standard student and client phone numbers are automatically rejected at the OTP verification gate.

---

## 2. Employer / Client Verifications

To prevent fraudulent job offers, all newly onboarded employers must be vetted before they can publish jobs:

1. Navigate to the **Clients** tab on the bottom navigation bar.
2. Review the list of registrations marked as **PENDING**.
3. Inspect company coordinates:
   * Company legal name
   * Contact person & official phone number
   * Registered office location & industry
   * Official website and company profile
4. **To Approve**:
   * Tap **Approve Client**.
   * Confirm prompt. The employer is immediately activated and granted job creation permissions.
5. **To Reject**:
   * Tap **Reject**.
   * Provide specific, constructive feedback (e.g., *"Missing GSTIN verification; please upload corporate registration certificate"*).
   * Confirm rejection. The employer will see this feedback in their profile setup screen and can resubmit.

---

## 3. Job Moderation Workflows

All job postings submitted by approved clients enter the moderation queue before appearing in the Student Marketplace:

1. Navigate to the **Jobs** tab.
2. Review listings marked as **PENDING**.
3. Verification criteria:
   * Budget / Stipend is clear and above minimum wage standards.
   * Job description contains clear deliverables and technical requirements.
   * No off-platform security deposit requests or phishing links.
4. **Approve & Publish**:
   * Tap **Approve & Publish**. The job listing is immediately indexed in the Student Marketplace.
5. **Reject Listing**:
   * Tap **Reject**. State the moderation reason. The employer receives an instant alert to revise and resubmit.

---

## 4. User Directory & Account Suspension

1. Navigate to the **Users** tab.
2. Search by phone number, user name, or UID.
3. Filter by role (`Student`, `Client`, `Staff`) or status (`Active`, `Suspended`).
4. **Suspending an Account**:
   * Tap **Suspend Account**.
   * Suspended accounts are immediately disconnected: Firestore security rules reject all reads and writes, and the app prompts the user that their account has been restricted.
   * This action is recorded in the immutable audit log.

---

## 5. Broadcast Push Notifications

1. Open **Menu** -> **Broadcast Push Notifications**.
2. Select target audience:
   * `All Users`: Dispatches to both Student and Client apps.
   * `Students Only`: Announcements regarding semester projects or hackathons.
   * `Clients Only`: Invoicing or candidate pipeline updates.
   * `Staff / Admins`: Internal moderation notices.
3. Enter **Notification Title** and **Message Body**.
4. (Optional) Provide a deep link URI (e.g., `tech2place://student/jobs/job-101`) to direct recipients to a specific screen upon tapping the notification.
5. Tap **Dispatch Notification**. The broadcast is executed via Firebase Cloud Messaging (FCM).

---

## 6. Staff & RBAC Management

Only `superuser` accounts can onboard and configure administrative personnel:

1. Open **Menu** -> **Staff & Granular RBAC**.
2. Tap **+ Add Staff**.
3. Enter full name, phone number, official email, and select role:
   * **Superuser**: Full unrestricted system privileges.
   * **Admin**: User management, approvals, version controls, categories.
   * **Moderator**: Limited to reviewing jobs, client submissions, and user reports.
4. Toggle specific granular permissions as required.
5. Tap **Create Staff**.

---

## 7. Security & Immutable Audit Trail

1. Open **Menu** -> **Security & Audit Logs**.
2. Every administrative intervention (approvals, rejections, suspensions, version bumps, push campaigns) is recorded with:
   * Operator Name and Admin UID
   * Exact action code (e.g. `APPROVE_JOB`, `SUSPEND_USER`)
   * Target ID and target type
   * Full JSON payload and timestamp
3. **Immutability Guarantee**: Security rules at the database layer prohibit updating or deleting records in the `audit_logs` collection.
