# GoTechPlace — Complete Mobile Apps & Web Platform Ecosystem

**GoTechPlace** ([gotechplace.com](https://gotechplace.com)) is a unified, production-ready full-stack platform and React Native Android ecosystem connecting engineering students, industrial employers/clients, and platform administrators through a single monorepo backed by Google Firebase.

---

## 🌐 Ecosystem Architecture

The repository contains the deployed web portal, three dedicated native Android applications, a centralized shared TypeScript library, and production Firebase infrastructure:

```text
gotechplace/
├── website/             # Web Portal & CMS (React + Vite + Tailwind, gotechplace.com)
├── student/             # Student Mobile Application (com.gotechplace.student)
├── client/              # Client / Employer Application (com.gotechplace.client)
├── admin/               # Administrative Management Console (com.gotechplace.admin)
├── shared/              # Centralized Models, Utilities, Theme, RBAC, Services & UI (@gotechplace/shared)
├── firebase/            # Production Firestore Rules, Storage Rules, Indexes & Cloud Functions
├── tests/               # Automated Unit & Integration Test Suites
└── package.json         # Monorepo Workspace Configuration
```

---

## 🌟 Applications Breakdown

### 1. Web Portal & CMS (`website/`, `https://gotechplace.com`)
* **Landing & Showcase**: Discovery platform for engineering students, project listings, upskilling courses, and career opportunities.
* **Content Management System (CMS)**: Interactive administration for academic projects, job listings, and staff operations.
* **Tech Stack**: React 18, Vite, Tailwind CSS, Firebase Client SDK, Netlify Functions.

### 2. Student Mobile App (`student/`, `com.gotechplace.student`)
* **Authentication**: Firebase Phone OTP login, new student onboarding, profile management.
* **Academic Projects**: Minor and Major academic projects marketplace with branch filters, search, and reservation/booking flow.
* **Approved Client Jobs**: Searchable marketplace of verified client jobs and internships with stipend ranges, skill tags, and location.
* **Applications Management**: Real-time status tracking for submitted job applications (`applied`, `reviewing`, `shortlisted`, `rejected`, `hired`).
* **Courses & Upskilling**: Curated technical courses with module tracking and enrollment.
* **System Guards**: Remote force update detection and maintenance mode screen.

### 3. Client / Employer App (`client/`, `com.gotechplace.client`)
* **Authentication**: Phone OTP authentication with business profile registration.
* **Verification Gate**: Mandatory Admin approval requirement (`pending_approval` state blocks job posting until platform review).
* **Job Management**: Create job postings with titles, budgets, skill tags, deadlines, attachments, and remote status.
* **Applicant Review**: Review applicants per job, download student resumes, update candidate application stages.
* **Company Profile**: Public branding and recruiter contact coordinates.

### 4. Admin Console App (`admin/`, `com.gotechplace.admin`)
* **Executive Dashboard**: Platform analytics, registration rates, active/pending job counters.
* **Client Approvals**: Review employer verification submissions; approve or reject with mandatory feedback.
* **Job Approvals**: Moderate incoming client jobs before they appear in the student marketplace.
* **User Directory**: Search, inspect, and suspend/activate students or employers with security audit logging.
* **Version Management**: Configure `minimumVersion`, `latestVersion`, `updateMode` (`force`, `flexible`, `optional`), and maintenance mode independently for Student, Client, and Admin apps.
* **Notification Broadcasting**: Compose and push announcements targeting specific user segments (`all`, `students`, `clients`, `admins`).
* **Staff & RBAC**: Onboard administrative personnel with granular permissions (`jobs.approve`, `clients.approve`, `users.suspend`, `staff.manage`).
* **Audit Trail**: Immutable chronological security ledger recording all administrative interventions.

---

## 🛠️ Monorepo Quickstart

### Prerequisites
* **Node.js**: v18.0.0 or higher (v22+ recommended)
* **Java Development Kit (JDK)**: JDK 17 (Azul Zulu or Eclipse Temurin)
* **Android Studio**: Android SDK 35, Build-Tools 35.0.0, NDK 26.1.10909125

### Installation
```bash
# Clone and checkout development branch
git checkout gotechplace-ecosystem

# Install workspace dependencies
npm install
```

### Running Automated Tests
```bash
npm test
```
Runs 27 automated unit and integration tests covering:
* Semantic version comparisons (`1.4.9 < 1.4.10`, `1.9.0 < 1.10.0`, `2.0.0 > 1.99.99`)
* Force update threshold evaluations
* Granular RBAC permissions and security barriers
* Client job approval and student visibility lifecycle
* Phone OTP normalization and account status gating

### Running the Web Portal
```bash
npm run website:dev     # Starts local Vite development server
npm run website:build   # Produces production-optimized web bundle
```

### Running Mobile Applications

#### Run Student App:
```bash
npm run student:start
# In a separate terminal or emulator:
npm run student:android
```

#### Run Client App:
```bash
npm run client:start
# In a separate terminal or emulator:
npm run client:android
```

#### Run Admin App:
```bash
npm run admin:start
# In a separate terminal or emulator:
npm run admin:android
```

---

## 🔒 Security & Data Integrity
* **Firestore Security Rules**: Role-based access prevention ensuring clients cannot approve their own listings and students cannot modify job data.
* **Immutable Audit Trail**: `audit_logs` collections are strictly append-only with updates and deletes blocked at the database security rule layer.
* **Zero Secret Leakage**: API keys, signing keystores, and service accounts are isolated in environment variables.

---

## 📚 Detailed Documentation
* [Architecture Guide](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/ARCHITECTURE.md)
* [Firebase Architecture & Rules](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/FIREBASE.md)
* [Android Setup & Build Guide](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/ANDROID_SETUP.md)
* [Developer Guide](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/DEVELOPMENT.md)
* [Release & Deployment Runbook](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/RELEASE.md)
* [Admin Console Operational Manual](file:///Users/sudhir/Documents/Projects/7CareerHub/career-hub/ADMIN_GUIDE.md)
