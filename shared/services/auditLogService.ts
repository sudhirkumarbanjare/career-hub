import { AuditAction, AuditLogEntry } from '../types/audit';

export const AuditLogService = {
  createEntry(
    admin: { uid: string; name: string },
    action: AuditAction,
    targetType: AuditLogEntry['targetType'],
    targetId?: string,
    metadata?: Record<string, any>
  ): AuditLogEntry {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      adminId: admin.uid,
      adminName: admin.name,
      action,
      targetId,
      targetType,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    };
  },
};
