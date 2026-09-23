export type AppId = 'student' | 'client' | 'admin';

export type UpdateMode = 'optional' | 'force';

export interface AppVersionConfig {
  appId: AppId;
  latestVersion: string;
  minimumVersion: string;
  updateMode: UpdateMode;
  updateTitle: string;
  updateMessage: string;
  androidStoreUrl: string;
  maintenance: boolean;
  maintenanceMessage?: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface VersionCheckResult {
  needsForceUpdate: boolean;
  needsOptionalUpdate: boolean;
  isMaintenanceMode: boolean;
  currentVersion: string;
  latestVersion: string;
  minimumVersion: string;
  updateTitle?: string;
  updateMessage?: string;
  storeUrl?: string;
  maintenanceMessage?: string;
}
