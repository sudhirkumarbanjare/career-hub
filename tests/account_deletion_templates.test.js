import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AccountDeletionService } from '../shared/dist/services/accountDeletionService.js';
import { NotificationService } from '../shared/dist/services/notificationService.js';
import { DEFAULT_NOTIFICATION_TEMPLATES } from '../shared/dist/data/defaultNotificationTemplates.js';

describe('Production Account Deletion & Notification Template Engine Tests', () => {
  beforeEach(() => {
    AccountDeletionService.resetState();
    NotificationService.resetTemplates();
  });

  describe('1. Self-Account Deletion (Student & Client)', () => {
    test('Student Self-Deletion: Fresh Phone OTP + Complete Data Cleanup', async () => {
      const studentUser = {
        uid: 'usr_student_test_401',
        phoneNumber: '+919876543210',
        role: 'student',
        name: 'Test Student',
      };

      // Step 1: Request OTP
      const otpRes = AccountDeletionService.requestDeletionOtp(studentUser);
      assert.strictEqual(otpRes.success, true);
      assert.ok(otpRes.message.includes('Fresh verification OTP'));

      // Step 2: Attempt wrong OTP
      const wrongVerify = AccountDeletionService.verifyDeletionOtp(studentUser, '000000');
      assert.strictEqual(wrongVerify.success, false);
      assert.ok(wrongVerify.error && wrongVerify.error.includes('Incorrect'));

      // Step 3: Verify with correct OTP
      const correctVerify = AccountDeletionService.verifyDeletionOtp(studentUser, '123456');
      assert.strictEqual(correctVerify.success, true);

      // Step 4: Unauthorized deletion attempt (wrong OTP) must fail
      AccountDeletionService.requestDeletionOtp(studentUser);
      const unauthorizedRes = await AccountDeletionService.executeSelfDeletion(studentUser, '000000');
      assert.strictEqual(unauthorizedRes.success, false);
      assert.ok(unauthorizedRes.error && (unauthorizedRes.error.includes('Incorrect') || unauthorizedRes.error.includes('OTP')));

      // Step 5: Authorized deletion execution with fresh OTP
      AccountDeletionService.requestDeletionOtp(studentUser);
      let customCleaned = false;
      const deleteRes = await AccountDeletionService.executeSelfDeletion(
        studentUser,
        '123456',
        async (uid, role) => {
          assert.strictEqual(uid, studentUser.uid);
          assert.strictEqual(role, 'student');
          customCleaned = true;
        }
      );

      assert.strictEqual(deleteRes.success, true);
      assert.strictEqual(customCleaned, true);
      assert.ok(deleteRes.deletionJobId.startsWith('del_'));
      assert.strictEqual(deleteRes.details?.authDeleted, true);
      assert.ok(deleteRes.details?.collectionsCleaned.includes('users'));
      assert.ok(deleteRes.details?.collectionsCleaned.includes('students'));
      assert.ok(deleteRes.details?.collectionsCleaned.includes('devices'));
      assert.ok(deleteRes.details?.collectionsCleaned.includes('notifications'));

      // Verify Deletion Job record created and marked completed
      const job = AccountDeletionService.getDeletionJobById(deleteRes.deletionJobId);
      assert.ok(job);
      assert.strictEqual(job?.status, 'COMPLETED');
      assert.strictEqual(job?.targetUid, studentUser.uid);
      assert.strictEqual(job?.isSelfDeletion, true);
    });

    test('Client Self-Deletion: Fresh Phone OTP + Employer Record Cleanup', async () => {
      const clientUser = {
        uid: 'usr_client_test_502',
        phoneNumber: '+919876543211',
        role: 'client',
        name: 'Test Employer Client',
      };

      // Request and verify OTP
      AccountDeletionService.requestDeletionOtp(clientUser);

      let employerCleaned = false;
      const deleteRes = await AccountDeletionService.executeSelfDeletion(
        clientUser,
        '123456',
        async (uid, role) => {
          assert.strictEqual(uid, clientUser.uid);
          assert.strictEqual(role, 'client');
          employerCleaned = true;
        }
      );

      assert.strictEqual(deleteRes.success, true);
      assert.strictEqual(employerCleaned, true);
      assert.ok(deleteRes.details?.collectionsCleaned.includes('clients'));

      const job = AccountDeletionService.getDeletionJobById(deleteRes.deletionJobId);
      assert.strictEqual(job?.status, 'COMPLETED');
      assert.strictEqual(job?.targetRole, 'client');
    });

    test('Deletion Idempotency: Re-running deletion on already purged user is safe', async () => {
      const targetUser = {
        uid: 'usr_student_idempotent_test',
        phoneNumber: '+919876543212',
        role: 'student',
        name: 'Idempotent User',
      };

      // First run
      AccountDeletionService.requestDeletionOtp(targetUser);
      const res1 = await AccountDeletionService.executeSelfDeletion(targetUser, '123456');
      assert.strictEqual(res1.success, true);

      // Second run (simulate retry/re-entry)
      AccountDeletionService.requestDeletionOtp(targetUser);
      const res2 = await AccountDeletionService.executeSelfDeletion(targetUser, '123456');
      assert.strictEqual(res2.success, true);
      assert.ok(res2.deletionJobId);
    });
  });

  describe('2. Superuser Permanent User Deletion (Admin App)', () => {
    test('Superuser can permanently delete any user with exact confirmation phrase', async () => {
      const targetUser = {
        uid: 'usr_student_himanshu',
        phoneNumber: '+919876543210',
        role: 'student',
        name: 'Himanshu Banjare',
      };

      const superuser = {
        uid: 'usr_superuser_root',
        phoneNumber: '+919999900001',
        role: 'superuser',
        name: 'Root Superuser',
      };

      const regularAdmin = {
        uid: 'usr_admin_standard',
        phoneNumber: '+919999900002',
        role: 'admin',
        name: 'Standard Admin',
      };

      const staffUser = {
        uid: 'usr_staff_member',
        phoneNumber: '+919999900003',
        role: 'staff',
        name: 'Staff Member',
      };

      // 1. Staff attempts deletion -> REJECTED
      const staffRes = await AccountDeletionService.executeSuperuserDeletion(
        targetUser,
        staffUser,
        'DELETE'
      );
      assert.strictEqual(staffRes.success, false);
      assert.ok(staffRes.error && staffRes.error.includes('superuser'));

      // 2. Regular Admin attempts deletion -> REJECTED
      const adminRes = await AccountDeletionService.executeSuperuserDeletion(
        targetUser,
        regularAdmin,
        'DELETE'
      );
      assert.strictEqual(adminRes.success, false);
      assert.ok(adminRes.error && adminRes.error.includes('superuser'));

      // 3. Superuser with invalid confirmation phrase -> REJECTED
      const wrongPhraseRes = await AccountDeletionService.executeSuperuserDeletion(
        targetUser,
        superuser,
        'WRONG_PHRASE'
      );
      assert.strictEqual(wrongPhraseRes.success, false);
      assert.ok(wrongPhraseRes.error && wrongPhraseRes.error.includes('Invalid confirmation phrase'));

      // 4. Superuser attempts self-deletion via admin endpoint -> REJECTED
      const selfDeleteRes = await AccountDeletionService.executeSuperuserDeletion(
        superuser,
        superuser,
        'DELETE'
      );
      assert.strictEqual(selfDeleteRes.success, false);
      assert.ok(selfDeleteRes.error && selfDeleteRes.error.includes('Self-deletion of superuser is prevented'));

      // 5. Superuser with valid confirmation phrase ('DELETE' or target UID) -> SUCCESS
      let deepCleaned = false;
      const validRes = await AccountDeletionService.executeSuperuserDeletion(
        targetUser,
        superuser,
        'DELETE',
        async (targetUid, role) => {
          assert.strictEqual(targetUid, targetUser.uid);
          assert.strictEqual(role, 'student');
          deepCleaned = true;
        }
      );

      assert.strictEqual(validRes.success, true);
      assert.strictEqual(deepCleaned, true);
      assert.ok(validRes.deletionJobId.startsWith('del_super_'));

      const job = AccountDeletionService.getDeletionJobById(validRes.deletionJobId);
      assert.ok(job);
      assert.strictEqual(job?.status, 'COMPLETED');
      assert.strictEqual(job?.requestedByRole, 'superuser');
      assert.strictEqual(job?.isSelfDeletion, false);
      assert.ok(job?.deletedCollections.includes('users'));
      assert.ok(job?.deletedCollections.includes('students'));
      assert.ok(job?.deletedCollections.includes('applications'));
    });
  });

  describe('3. 30 Predefined Push Notification Templates (10 Student, 10 Client, 10 Admin)', () => {
    test('Exactly 30 system templates are bundled (10 per app)', () => {
      const allTemplates = NotificationService.getTemplates('all');
      assert.strictEqual(allTemplates.length, 30);

      const studentTemplates = NotificationService.getTemplates('student');
      assert.strictEqual(studentTemplates.length, 10);

      const clientTemplates = NotificationService.getTemplates('client');
      assert.strictEqual(clientTemplates.length, 10);

      const adminTemplates = NotificationService.getTemplates('admin');
      assert.strictEqual(adminTemplates.length, 10);
    });

    test('All 30 system templates are marked isPredefined and active', () => {
      const allTemplates = NotificationService.getTemplates('all');
      for (const tmpl of allTemplates) {
        assert.strictEqual(tmpl.isPredefined, true);
        assert.strictEqual(tmpl.status, 'active');
        assert.ok(tmpl.name.length > 0);
        assert.ok(tmpl.title.length > 0);
        assert.ok(tmpl.body.length > 0);
        assert.ok(['student', 'client', 'admin'].includes(tmpl.app));
      }
    });

    test('Predefined system templates cannot be deleted', () => {
      const firstSystemTmpl = NotificationService.getTemplates('student')[0];
      const deleteRes = NotificationService.deleteCustomTemplate(firstSystemTmpl.id);
      assert.strictEqual(deleteRes.success, false);
      assert.ok(deleteRes.error && deleteRes.error.includes('Predefined system templates cannot be deleted'));
    });
  });

  describe('4. Custom Notification Template CRUD & Duplication', () => {
    test('Admin/Superuser can create, read, update, duplicate, and delete custom templates', () => {
      // 1. Create
      const createRes = NotificationService.createCustomTemplate({
        name: 'Urgent Hackathon Invitation',
        app: 'student',
        targetRole: 'student',
        title: '🔥 {{student_name}}, Register for Hackathon 2026!',
        body: 'Join the premier coding contest before {{deadline}} at {{location}}.',
        category: 'courses',
        deepLink: 'careerhub://hackathons/2026',
        createdByUid: 'usr_admin_1',
      });

      assert.strictEqual(createRes.success, true);
      assert.ok(createRes.template);
      assert.strictEqual(createRes.template.isPredefined, false);
      assert.strictEqual(createRes.template.variables.includes('student_name'), true);
      assert.strictEqual(createRes.template.variables.includes('deadline'), true);
      assert.strictEqual(createRes.template.variables.includes('location'), true);

      const customId = createRes.template.id;

      // 2. Read
      const fetched = NotificationService.getTemplateById(customId);
      assert.ok(fetched);
      assert.strictEqual(fetched && fetched.name, 'Urgent Hackathon Invitation');

      // 3. Update
      const updateRes = NotificationService.updateTemplate(customId, {
        name: 'Urgent Hackathon Invitation (Updated)',
        body: 'Join the premier coding contest before {{deadline}} on our campus.',
      });
      assert.strictEqual(updateRes.success, true);
      assert.strictEqual(updateRes.template && updateRes.template.name, 'Urgent Hackathon Invitation (Updated)');
      assert.strictEqual(updateRes.template && updateRes.template.variables.includes('location'), false);

      // 4. Duplicate
      const dupRes = NotificationService.duplicateTemplate(customId, 'usr_admin_1');
      assert.strictEqual(dupRes.success, true);
      assert.ok(dupRes.template);
      assert.strictEqual(dupRes.template.isPredefined, false);
      assert.ok(dupRes.template.name.includes('Copy of'));

      // 5. Delete custom template
      const deleteRes = NotificationService.deleteCustomTemplate(customId);
      assert.strictEqual(deleteRes.success, true);
      assert.strictEqual(NotificationService.getTemplateById(customId), undefined);
    });
  });

  describe('5. Variable Resolution Engine & Placeholder Validation', () => {
    test('Extracts variable placeholders accurately from text', () => {
      const text = 'Hello {{student_name}}, your application for {{job_title}} at {{company_name}} is {{application_status}}!';
      const vars = NotificationService.extractVariables(text);
      assert.deepStrictEqual(vars, ['student_name', 'job_title', 'company_name', 'application_status']);
    });

    test('Renders template successfully with valid parameters', () => {
      const tmpl = NotificationService.getTemplateById('tmpl_std_06_application_status');
      assert.ok(tmpl);

      const rendered = NotificationService.renderTemplate(tmpl, {
        company_name: 'Tech Corp',
        job_title: 'Full Stack Engineer',
        application_status: 'Shortlisted',
      });

      assert.strictEqual(rendered.hasUnrenderedPlaceholders, false);
      assert.strictEqual(rendered.missingVariables.length, 0);
      assert.ok(rendered.renderedTitle.includes('Shortlisted'));
      assert.ok(rendered.renderedBody.includes('Tech Corp'));
      assert.ok(rendered.renderedBody.includes('Full Stack Engineer'));
      assert.ok(!rendered.renderedBody.includes('{{'));
    });

    test('Detects missing variables and prevents unrendered placeholders from leaking to users', () => {
      const tmpl = NotificationService.getTemplateById('tmpl_std_06_application_status');
      assert.ok(tmpl);
      const rendered = NotificationService.renderTemplate(tmpl, {
        company_name: 'Tech Corp',
        // missing job_title and application_status
      });

      assert.strictEqual(rendered.hasUnrenderedPlaceholders, true);
      assert.ok(rendered.missingVariables.includes('job_title'));
      assert.ok(rendered.missingVariables.includes('application_status'));
    });
  });
});
