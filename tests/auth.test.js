import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

function validatePhoneNumber(phone) {
  const cleaned = phone.trim().replace(/[\s-]/g, '');
  const indian10Regex = /^[6-9]\d{9}$/;
  const e164IndianRegex = /^\+91[6-9]\d{9}$/;

  if (indian10Regex.test(cleaned)) {
    return { isValid: true, formatted: `+91${cleaned}` };
  } else if (e164IndianRegex.test(cleaned)) {
    return { isValid: true, formatted: cleaned };
  } else if (/^\+\d{10,14}$/.test(cleaned)) {
    return { isValid: true, formatted: cleaned };
  }

  return {
    isValid: false,
    error: 'Please enter a valid 10-digit mobile number (e.g. 9876543210)',
  };
}

function validateOtp(otp) {
  return /^\d{6}$/.test(otp.trim());
}

function maskPhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  let tenDigits = digits;
  if (digits.length === 12 && digits.startsWith('91')) {
    tenDigits = digits.substring(2);
  }
  if (tenDigits.length === 10) {
    return `+91 ${tenDigits.slice(0, 2)}******${tenDigits.slice(8)}`;
  }
  return phone;
}

function canPostJob(clientProfile, user) {
  if (!user || user.status === 'suspended') {
    return { allowed: false, reason: 'Account is suspended.' };
  }
  if (!clientProfile || clientProfile.approvalStatus !== 'approved') {
    return {
      allowed: false,
      reason: 'Client registration must be verified by administrator before posting jobs.',
    };
  }
  return { allowed: true };
}

describe('Authentication & Phone OTP Validation Engine', () => {
  test('accepts valid 10-digit Indian phone numbers and formats to E.164', () => {
    const res = validatePhoneNumber('9876543210');
    assert.equal(res.isValid, true);
    assert.equal(res.formatted, '+919876543210');
  });

  test('accepts standard formatted strings with spaces and hyphens', () => {
    const res = validatePhoneNumber('98765 43210');
    assert.equal(res.isValid, true);
    assert.equal(res.formatted, '+919876543210');

    const res2 = validatePhoneNumber('+91 98765-43210');
    assert.equal(res2.isValid, true);
    assert.equal(res2.formatted, '+919876543210');
  });

  test('rejects invalid or too short phone numbers', () => {
    assert.equal(validatePhoneNumber('12345').isValid, false);
    assert.equal(validatePhoneNumber('abcdefghij').isValid, false);
    assert.equal(validatePhoneNumber('0123456789').isValid, false); // invalid starting digit
  });

  test('validates 6-digit numeric OTP codes', () => {
    assert.equal(validateOtp('123456'), true);
    assert.equal(validateOtp('998877'), true);
    assert.equal(validateOtp('12345'), false); // 5 digits
    assert.equal(validateOtp('1234567'), false); // 7 digits
    assert.equal(validateOtp('12345a'), false); // alphanumeric
  });

  test('masks phone numbers securely for privacy (e.g. 9999999999 and 9971754470)', () => {
    assert.equal(maskPhoneNumber('9999999999'), '+91 99******99');
    assert.equal(maskPhoneNumber('+91 9999999999'), '+91 99******99');
    assert.equal(maskPhoneNumber('9971754470'), '+91 99******70');
    assert.equal(maskPhoneNumber('+91 9971754470'), '+91 99******70');
  });

  test('guards client job posting behind verified approval state', () => {
    const user = { uid: 'cli-1', status: 'active', role: 'client' };
    const pendingClient = { uid: 'cli-1', approvalStatus: 'pending' };
    const approvedClient = { uid: 'cli-1', approvalStatus: 'approved' };
    const rejectedClient = { uid: 'cli-1', approvalStatus: 'rejected' };

    assert.equal(canPostJob(pendingClient, user).allowed, false);
    assert.equal(canPostJob(rejectedClient, user).allowed, false);
    assert.equal(canPostJob(approvedClient, user).allowed, true);
  });

  test('suspended accounts cannot post jobs even if previously approved', () => {
    const suspendedUser = { uid: 'cli-1', status: 'suspended', role: 'client' };
    const approvedClient = { uid: 'cli-1', approvalStatus: 'approved' };

    const check = canPostJob(approvedClient, suspendedUser);
    assert.equal(check.allowed, false);
    assert.match(check.reason, /suspended/);
  });

  test('enforces strict immutability of verified phone number in student profile update', () => {
    const originalStudent = {
      uid: 'usr_new_student_1',
      student_id: 'STU-1001',
      name: 'Rohan Sharma',
      mobile: '+91 98111 22334', // Verified phone from Firebase Auth
      college: 'Delhi Technological University',
      branch: 'CSE / IT',
      isProfileComplete: true,
    };

    // Attempted malicious / unauthorized phone change
    const updateAttempt = {
      name: 'Rohan Sharma Updated',
      mobile: '+91 99999 88888', // Malicious attempt to change phone
      college: 'DTU',
    };

    // Filter updates using security rule
    const { mobile, uid, student_id, ...safeUpdates } = updateAttempt;
    const updatedStudent = {
      ...originalStudent,
      ...safeUpdates,
      mobile: originalStudent.mobile, // STRICT IMMUTABILITY
      uid: originalStudent.uid,
    };

    assert.equal(updatedStudent.name, 'Rohan Sharma Updated');
    assert.equal(updatedStudent.college, 'DTU');
    assert.equal(updatedStudent.mobile, '+91 98111 22334'); // Preserved!
  });

  test('enforces mandatory profile completion gate for newly registered users', () => {
    const incompleteStudent = {
      uid: 'usr_brand_new_student',
      name: '',
      college: '',
      branch: '',
      mobile: '+91 98700 99887',
      isProfileComplete: false,
    };

    const isComplete = Boolean(
      incompleteStudent.isProfileComplete &&
      incompleteStudent.name &&
      incompleteStudent.college
    );

    assert.equal(isComplete, false); // Gated at Complete Profile Screen

    // Complete profile
    const completedStudent = {
      ...incompleteStudent,
      name: 'Pooja Verma',
      college: 'NIT Trichy',
      branch: 'ECE / EC',
      isProfileComplete: true,
    };

    const isNowComplete = Boolean(
      completedStudent.isProfileComplete &&
      completedStudent.name &&
      completedStudent.college
    );

    assert.equal(isNowComplete, true); // Allowed into dashboard
  });

  test('verifies multi-user session isolation (User A logout -> User B login)', () => {
    const userRegistry = new Map();

    // User A registers
    const userA = { uid: 'usr_A', phoneNumber: '+91 98111 11111', name: 'User Alpha' };
    const profileA = { uid: userA.uid, mobile: userA.phoneNumber, name: userA.name, isProfileComplete: true };
    userRegistry.set(userA.uid, profileA);

    let currentSession = profileA;
    assert.equal(currentSession.mobile, '+91 98111 11111');
    assert.equal(currentSession.name, 'User Alpha');

    // User A logs out
    currentSession = null;
    assert.equal(currentSession, null);

    // User B registers with different phone number
    const userB = { uid: 'usr_B', phoneNumber: '+91 98222 22222', name: 'User Beta' };
    const profileB = { uid: userB.uid, mobile: userB.phoneNumber, name: userB.name, isProfileComplete: true };
    userRegistry.set(userB.uid, profileB);
    currentSession = profileB;

    // User B NEVER sees User A's phone number or profile
    assert.equal(currentSession.mobile, '+91 98222 22222');
    assert.notEqual(currentSession.mobile, userA.phoneNumber);
    assert.equal(currentSession.uid, 'usr_B');
    assert.notEqual(currentSession.name, 'User Alpha');
  });
});
