import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Admin User Management & 9999999999 Phone Search Normalization', () => {
  // Admin Service user query simulation
  const mockAdminUsers = [
    {
      uid: 'admin_superuser_01',
      phoneNumber: '+91 99999 88888',
      name: 'Platform Superuser',
      role: 'superuser',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      uid: 'staff_mod_01',
      phoneNumber: '+91 98700 11223',
      name: 'Aditi Rao',
      role: 'moderator',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
    },
    {
      uid: 'usr_student_himanshu',
      phoneNumber: '+91 98765 43210',
      name: 'Himanshu Sharma',
      role: 'student',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-15T09:00:00.000Z',
      updatedAt: '2026-01-15T09:00:00.000Z',
    },
    {
      uid: 'usr_9999999999',
      phoneNumber: '+91 99999 99999',
      name: 'Himanshu Sharma (Verified Student)',
      role: 'student',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-16T09:00:00.000Z',
      updatedAt: '2026-01-16T09:00:00.000Z',
    },
    {
      uid: 'usr_client_demo',
      phoneNumber: '+91 98123 45678',
      name: 'Vikram Malhotra',
      role: 'client',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-20T11:00:00.000Z',
      updatedAt: '2026-01-20T11:00:00.000Z',
    },
  ];

  function queryUsers(list, filters) {
    let result = [...list];
    if (filters?.role && filters.role !== 'all') {
      result = result.filter((u) => u.role === filters.role);
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((u) => u.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      const qDigits = q.replace(/\D/g, '');
      result = result.filter((u) => {
        const nameMatch = u.name.toLowerCase().includes(q);
        const uidMatch = u.uid.toLowerCase().includes(q);
        const phoneRawMatch = u.phoneNumber.toLowerCase().includes(q);
        const phoneDigits = u.phoneNumber.replace(/\D/g, '');
        const phoneDigitMatch = qDigits.length >= 3 && phoneDigits.includes(qDigits);
        return nameMatch || uidMatch || phoneRawMatch || phoneDigitMatch;
      });
    }
    return result;
  }

  it('1. User 9999999999 is visible in Admin Users list by default', () => {
    const allUsers = queryUsers(mockAdminUsers);
    const user999 = allUsers.find((u) => u.uid === 'usr_9999999999');
    assert.ok(user999, 'User usr_9999999999 should be present in admin users directory');
    assert.equal(user999.role, 'student');
    assert.equal(user999.status, 'active');
  });

  it('2. Search by raw 10 digits "9999999999" finds formatted "+91 99999 99999"', () => {
    const results = queryUsers(mockAdminUsers, { search: '9999999999' });
    assert.ok(results.length >= 1, 'Should find user by raw 10 digits');
    const matched = results.find((u) => u.uid === 'usr_9999999999');
    assert.ok(matched, 'usr_9999999999 must match raw 10 digit search');
  });

  it('3. Search by partial phone digits "99999" finds "+91 99999 99999"', () => {
    const results = queryUsers(mockAdminUsers, { search: '99999' });
    assert.ok(results.length >= 1, 'Should find users matching partial digits');
    assert.ok(results.some((u) => u.uid === 'usr_9999999999'));
  });

  it('4. Search by formatted query "+91 99999 99999" finds the user', () => {
    const results = queryUsers(mockAdminUsers, { search: '+91 99999 99999' });
    assert.ok(results.some((u) => u.uid === 'usr_9999999999'));
  });

  it('5. Search by UID "usr_9999999999" finds the user', () => {
    const results = queryUsers(mockAdminUsers, { search: 'usr_9999999999' });
    assert.equal(results.length, 1);
    assert.equal(results[0].uid, 'usr_9999999999');
  });

  it('6. Search by name "Himanshu" finds both student demo accounts', () => {
    const results = queryUsers(mockAdminUsers, { search: 'Himanshu' });
    assert.equal(results.length, 2);
    assert.ok(results.some((u) => u.uid === 'usr_9999999999'));
    assert.ok(results.some((u) => u.uid === 'usr_student_himanshu'));
  });

  it('7. Role filter "student" correctly includes usr_9999999999', () => {
    const students = queryUsers(mockAdminUsers, { role: 'student' });
    assert.ok(students.some((u) => u.uid === 'usr_9999999999'));
    assert.ok(students.every((u) => u.role === 'student'));
  });
});
