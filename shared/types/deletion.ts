import { UserRole } from './user';

export type DeletionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PARTIALLY_COMPLETED';

export interface DeletionJob {
  id: string;
  targetUid: string;
  targetRole: UserRole;
  targetPhone: string;
  targetName?: string;
  requestedByUid: string;
  requestedByRole: UserRole;
  isSelfDeletion: boolean;
  status: DeletionStatus;
  deletedCollections: string[];
  deletedDevicesCount: number;
  deletedStorageObjects: string[];
  failures: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface DeletionResult {
  success: boolean;
  deletionJobId: string;
  message: string;
  deletedRecordsCount: number;
  details?: {
    collectionsCleaned: string[];
    devicesCleaned: number;
    authDeleted: boolean;
  };
  error?: string;
}
