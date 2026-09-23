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
});
