import { User, AdminProfile, Permission, UserRole } from '../types';
import { DEFAULT_ROLE_CONFIGS } from '../constants/roles';

export const RbacService = {
  /**
   * Check if a user role is an administrative role
   */
  isAdminRole(role: UserRole): boolean {
    return ['superuser', 'admin', 'staff', 'moderator', 'support'].includes(role);
  },

  /**
   * Check if a user has a specific permission
   */
  hasPermission(
    user: { role: UserRole; permissions?: Permission[] } | null | undefined,
    permission: Permission
  ): boolean {
    if (!user) return false;

    // Superuser has complete unrestricted access
    if (user.role === 'superuser') {
      return true;
    }

    // Normal students or clients NEVER have administrative permissions
    if (user.role === 'student' || user.role === 'client') {
      return false;
    }

    // Check user's explicit permissions array
    if (user.permissions && Array.isArray(user.permissions)) {
      if (user.permissions.includes(permission)) {
        return true;
      }
    }

    // Fallback to role default permissions
    const roleConfig = DEFAULT_ROLE_CONFIGS[user.role];
    if (roleConfig && roleConfig.permissions.includes(permission)) {
      return true;
    }

    return false;
  },

  /**
   * Check if user can approve/reject jobs
   */
  canApproveJobs(user: { role: UserRole; permissions?: Permission[] } | null | undefined): boolean {
    return this.hasPermission(user, 'jobs.approve');
  },

  /**
   * Check if user can approve/reject clients
   */
  canApproveClients(user: { role: UserRole; permissions?: Permission[] } | null | undefined): boolean {
    return this.hasPermission(user, 'clients.approve');
  },

  /**
   * Check if user can suspend users
   */
  canSuspendUsers(user: { role: UserRole; permissions?: Permission[] } | null | undefined): boolean {
    return this.hasPermission(user, 'users.suspend');
  },

  /**
   * Check if user can manage staff (superuser or authorized admin only)
   */
  canManageStaff(user: { role: UserRole; permissions?: Permission[] } | null | undefined): boolean {
    return this.hasPermission(user, 'staff.create') || this.hasPermission(user, 'staff.edit');
  },

  /**
   * Check if user can manage app versions
   */
  canManageVersions(user: { role: UserRole; permissions?: Permission[] } | null | undefined): boolean {
    return this.hasPermission(user, 'app_versions.update');
  },

  /**
   * Check if user can send push notifications
   */
  canSendNotifications(user: { role: UserRole; permissions?: Permission[] } | null | undefined): boolean {
    return this.hasPermission(user, 'notifications.send');
  },

  /**
   * Get all effective permissions for a user
   */
  getEffectivePermissions(user: { role: UserRole; permissions?: Permission[] }): Permission[] {
    if (user.role === 'superuser') {
      return DEFAULT_ROLE_CONFIGS.superuser.permissions;
    }
    const set = new Set<Permission>(DEFAULT_ROLE_CONFIGS[user.role]?.permissions || []);
    if (user.permissions) {
      user.permissions.forEach((p) => set.add(p));
    }
    return Array.from(set);
  },
};
