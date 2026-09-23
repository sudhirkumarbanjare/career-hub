/**
 * Proper Semantic Versioning Comparison
 * Handles arbitrary segments (e.g. 1.4.9 vs 1.4.10, 1.9.0 vs 1.10.0, 2.0.0 vs 1.99.99)
 */

export function parseSemver(version: string): number[] {
  // Remove any leading 'v' or build/prerelease tags for standard numeric comparison
  const clean = version.trim().replace(/^v/, '').split('-')[0].split('+')[0];
  const parts = clean.split('.').map((p) => {
    const num = parseInt(p, 10);
    return isNaN(num) ? 0 : num;
  });

  // Ensure at least 3 segments [major, minor, patch]
  while (parts.length < 3) {
    parts.push(0);
  }
  return parts;
}

/**
 * Compares two semantic version strings.
 * Returns:
 *  -1 if v1 < v2
 *   0 if v1 === v2
 *   1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);

  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 < n2) return -1;
    if (n1 > n2) return 1;
  }
  return 0;
}

export const compareSemver = compareVersions;

export function isValidSemver(version: string): boolean {
  if (!version || typeof version !== 'string') return false;
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version.trim());
}

/**
 * Returns true if the installed currentVersion is strictly older than targetVersion.
 */
export function isVersionOlder(currentVersion: string, targetVersion: string): boolean {
  return compareVersions(currentVersion, targetVersion) < 0;
}

/**
 * Evaluates whether an app requires a force update or an optional update.
 */
export function evaluateUpdateStatus(
  currentVersion: string,
  minimumVersion: string,
  latestVersion: string,
  updateMode: 'force' | 'optional' | 'flexible'
): { needsForceUpdate: boolean; needsOptionalUpdate: boolean } {
  // If current is less than minimum version, force update is ALWAYS required regardless of updateMode
  if (isVersionOlder(currentVersion, minimumVersion)) {
    return { needsForceUpdate: true, needsOptionalUpdate: false };
  }

  // If current is less than latest version
  if (isVersionOlder(currentVersion, latestVersion)) {
    if (updateMode === 'force') {
      return { needsForceUpdate: true, needsOptionalUpdate: false };
    } else {
      return { needsForceUpdate: false, needsOptionalUpdate: true };
    }
  }

  return { needsForceUpdate: false, needsOptionalUpdate: false };
}
