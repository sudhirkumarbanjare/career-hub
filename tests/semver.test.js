import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test direct semver logic
function parseSemver(version) {
  const clean = version.trim().replace(/^v/, '').split('-')[0].split('+')[0];
  const parts = clean.split('.').map((p) => {
    const num = parseInt(p, 10);
    return isNaN(num) ? 0 : num;
  });
  while (parts.length < 3) {
    parts.push(0);
  }
  return parts;
}

function compareVersions(v1, v2) {
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

function isValidSemver(version) {
  if (!version || typeof version !== 'string') return false;
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version.trim());
}

function isVersionOlder(currentVersion, targetVersion) {
  return compareVersions(currentVersion, targetVersion) < 0;
}

function evaluateUpdateStatus(currentVersion, minimumVersion, latestVersion, updateMode) {
  if (isVersionOlder(currentVersion, minimumVersion)) {
    return { needsForceUpdate: true, needsOptionalUpdate: false };
  }
  if (isVersionOlder(currentVersion, latestVersion)) {
    if (updateMode === 'force') {
      return { needsForceUpdate: true, needsOptionalUpdate: false };
    } else {
      return { needsForceUpdate: false, needsOptionalUpdate: true };
    }
  }
  return { needsForceUpdate: false, needsOptionalUpdate: false };
}

describe('Semantic Versioning & Force Update Engine', () => {
  test('handles numeric multi-digit comparisons correctly (1.4.9 < 1.4.10)', () => {
    assert.equal(compareVersions('1.4.9', '1.4.10'), -1);
    assert.equal(compareVersions('1.4.10', '1.4.9'), 1);
  });

  test('handles minor version rollups (1.9.0 < 1.10.0)', () => {
    assert.equal(compareVersions('1.9.0', '1.10.0'), -1);
    assert.equal(compareVersions('1.10.0', '1.9.0'), 1);
  });

  test('handles major version rollups (2.0.0 > 1.99.99)', () => {
    assert.equal(compareVersions('2.0.0', '1.99.99'), 1);
    assert.equal(compareVersions('1.99.99', '2.0.0'), -1);
  });

  test('handles identical versions', () => {
    assert.equal(compareVersions('1.2.3', '1.2.3'), 0);
  });

  test('validates valid semver strings correctly', () => {
    assert.equal(isValidSemver('1.0.0'), true);
    assert.equal(isValidSemver('0.1.0'), true);
    assert.equal(isValidSemver('10.20.30'), true);
    assert.equal(isValidSemver('1.0.0-beta.1'), true);
  });

  test('rejects invalid semver strings', () => {
    assert.equal(isValidSemver('1.0'), false);
    assert.equal(isValidSemver('v1.0.0'), false);
    assert.equal(isValidSemver('abc'), false);
    assert.equal(isValidSemver('1.2.3.4'), false);
    assert.equal(isValidSemver('-1.0.0'), false);
  });

  test('evaluates force update when installed version is below minimum', () => {
    const res = evaluateUpdateStatus('1.0.0', '1.1.0', '1.2.0', 'optional');
    assert.equal(res.needsForceUpdate, true);
    assert.equal(res.needsOptionalUpdate, false);
  });

  test('evaluates optional update when installed version is above min but below latest (optional mode)', () => {
    const res = evaluateUpdateStatus('1.1.5', '1.1.0', '1.2.0', 'optional');
    assert.equal(res.needsForceUpdate, false);
    assert.equal(res.needsOptionalUpdate, true);
  });

  test('evaluates force update when installed version is between min and latest under force mode', () => {
    const res = evaluateUpdateStatus('1.1.5', '1.1.0', '1.2.0', 'force');
    assert.equal(res.needsForceUpdate, true);
    assert.equal(res.needsOptionalUpdate, false);
  });

  test('evaluates up to date when current matches or exceeds latest', () => {
    const res = evaluateUpdateStatus('1.2.0', '1.0.0', '1.2.0', 'force');
    assert.equal(res.needsForceUpdate, false);
    assert.equal(res.needsOptionalUpdate, false);

    const resFuture = evaluateUpdateStatus('1.2.1', '1.0.0', '1.2.0', 'force');
    assert.equal(resFuture.needsForceUpdate, false);
    assert.equal(resFuture.needsOptionalUpdate, false);
  });
});
