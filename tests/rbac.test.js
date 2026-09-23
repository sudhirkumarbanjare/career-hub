import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const DEFAULT_ROLE_CONFIGS = {
  student: {
    role: 'student',
    displayName: 'Student',
    defaultPermissions: ['jobs.view', 'applications.create', 'courses.view', 'projects.view'],
  },
  client: {
    role: 'client',
    displayName: 'Client Employer',
    defaultPermissions: ['jobs.create', 'jobs.view', 'applications.manage'],
  },
  moderator: {
    role: 'moderator',
    displayName: 'Content Moderator',
    defaultPermissions: [
      'jobs.view',
      'jobs.approve',
      'jobs.reject',
      'reports.view',
      'reports.manage',
    ],
  },
  admin: {
    role: 'admin',
    displayName: 'System Administrator',
    defaultPermissions: [
      'users.view',
      'users.suspend',
      'clients.view',
      'clients.approve',
      'clients.reject',
      'jobs.view',
      'jobs.approve',
      'jobs.reject',
      'jobs.delete',
      'versions.manage',
      'notifications.send',
      'reports.view',
      'reports.manage',
      'categories.manage',
      'audit.view',
    ],
  },
  superuser: {
    role: 'superuser',
    displayName: 'Super Administrator',
    defaultPermissions: [
      'users.view',
      'users.create',
      'users.suspend',
      'users.delete',
      'clients.view',
      'clients.approve',
      'clients.reject',
      'clients.delete',
      'jobs.view',
      'jobs.approve',
      'jobs.reject',
      'jobs.delete',
      'versions.manage',
      'notifications.send',
      'staff.manage',
      'reports.view',
      'reports.manage',
      'categories.manage',
      'audit.view',
      'system.manage',
    ],
  },
};

function hasPermission(user, permission, customPermissions) {
  if (!user || user.status === 'suspended') return false;
  if (user.role === 'superuser') return true;

  const roleConfig = DEFAULT_ROLE_CONFIGS[user.role];
  const rolePerms = roleConfig ? roleConfig.defaultPermissions : [];
  const assigned = customPermissions || rolePerms;

  return assigned.includes(permission);
}

function canAccessAdminConsole(user) {
  if (!user || user.status === 'suspended') return false;
  return user.role === 'superuser' || user.role === 'admin' || user.role === 'moderator';
}

describe('Role-Based Access Control (RBAC) System', () => {
  test('Superuser possesses blanket permissions for all actions', () => {
    const superuser = { uid: 'su-1', role: 'superuser', status: 'active' };
    assert.equal(hasPermission(superuser, 'system.manage'), true);
    assert.equal(hasPermission(superuser, 'staff.manage'), true);
    assert.equal(hasPermission(superuser, 'users.delete'), true);
    assert.equal(hasPermission(superuser, 'any.custom.action'), true);
  });

  test('Admin has job and client management but lacks staff/system manage', () => {
    const admin = { uid: 'admin-1', role: 'admin', status: 'active' };
    assert.equal(hasPermission(admin, 'clients.approve'), true);
    assert.equal(hasPermission(admin, 'jobs.approve'), true);
    assert.equal(hasPermission(admin, 'versions.manage'), true);
    assert.equal(hasPermission(admin, 'staff.manage'), false);
    assert.equal(hasPermission(admin, 'system.manage'), false);
  });

  test('Moderator can approve/reject jobs but cannot touch versions, users, or settings', () => {
    const moderator = { uid: 'mod-1', role: 'moderator', status: 'active' };
    assert.equal(hasPermission(moderator, 'jobs.approve'), true);
    assert.equal(hasPermission(moderator, 'jobs.reject'), true);
    assert.equal(hasPermission(moderator, 'reports.manage'), true);
    assert.equal(hasPermission(moderator, 'clients.approve'), false);
    assert.equal(hasPermission(moderator, 'users.suspend'), false);
    assert.equal(hasPermission(moderator, 'versions.manage'), false);
  });

  test('Student and Client accounts are denied administrative console access', () => {
    const student = { uid: 'stu-1', role: 'student', status: 'active' };
    const client = { uid: 'cli-1', role: 'client', status: 'active' };
    assert.equal(canAccessAdminConsole(student), false);
    assert.equal(canAccessAdminConsole(client), false);
    assert.equal(hasPermission(student, 'jobs.approve'), false);
    assert.equal(hasPermission(client, 'clients.approve'), false);
  });

  test('Suspended accounts are strictly blocked regardless of role', () => {
    const suspendedAdmin = { uid: 'admin-2', role: 'admin', status: 'suspended' };
    const suspendedSuper = { uid: 'su-2', role: 'superuser', status: 'suspended' };
    assert.equal(hasPermission(suspendedAdmin, 'jobs.view'), false);
    assert.equal(hasPermission(suspendedSuper, 'system.manage'), false);
    assert.equal(canAccessAdminConsole(suspendedAdmin), false);
    assert.equal(canAccessAdminConsole(suspendedSuper), false);
  });

  test('Custom assigned staff permissions correctly grant specific actions', () => {
    const customStaff = { uid: 'mod-custom', role: 'moderator', status: 'active' };
    const customPerms = ['jobs.approve', 'clients.approve']; // extra granted permission
    assert.equal(hasPermission(customStaff, 'clients.approve', customPerms), true);
    assert.equal(hasPermission(customStaff, 'users.suspend', customPerms), false);
  });
});
