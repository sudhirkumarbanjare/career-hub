import { AppId, AppVersionConfig, VersionCheckResult } from '../types/version';
import { evaluateUpdateStatus, isVersionOlder } from '../utils/semver';
import { DEFAULT_APP_VERSIONS } from '../constants/appConfig';

export const VersionCheckService = {
  /**
   * Evaluates version configuration against installed app version
   */
  evaluate(
    currentInstalledVersion: string,
    config: AppVersionConfig
  ): VersionCheckResult {
    // 1. Check maintenance mode
    if (config.maintenance) {
      return {
        needsForceUpdate: false,
        needsOptionalUpdate: false,
        isMaintenanceMode: true,
        currentVersion: currentInstalledVersion,
        latestVersion: config.latestVersion,
        minimumVersion: config.minimumVersion,
        maintenanceMessage: config.maintenanceMessage || 'We are performing scheduled maintenance. Please check back shortly.',
      };
    }

    // 2. Evaluate version updates using strict semantic versioning
    const { needsForceUpdate, needsOptionalUpdate } = evaluateUpdateStatus(
      currentInstalledVersion,
      config.minimumVersion,
      config.latestVersion,
      config.updateMode
    );

    return {
      needsForceUpdate,
      needsOptionalUpdate,
      isMaintenanceMode: false,
      currentVersion: currentInstalledVersion,
      latestVersion: config.latestVersion,
      minimumVersion: config.minimumVersion,
      updateTitle: config.updateTitle,
      updateMessage: config.updateMessage,
      storeUrl: config.androidStoreUrl,
    };
  },

  /**
   * Gets default fallback config for an app
   */
  getDefaultConfig(appId: AppId): AppVersionConfig {
    const def = DEFAULT_APP_VERSIONS[appId];
    return {
      appId,
      latestVersion: def.latestVersion,
      minimumVersion: def.minimumVersion,
      updateMode: def.updateMode,
      updateTitle: def.updateTitle,
      updateMessage: def.updateMessage,
      androidStoreUrl: def.androidStoreUrl,
      maintenance: def.maintenance,
      enabled: def.enabled,
      updatedAt: new Date().toISOString(),
    };
  },
};
