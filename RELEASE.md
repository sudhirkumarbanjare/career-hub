# TECH2PLACE Release & Deployment Runbook

This document defines the release procedures, versioning rules, Google Play Store distribution steps, and remote force-update management for the TECH2PLACE ecosystem.

---

## 1. Versioning Strategy

All applications follow **Semantic Versioning 2.0.0** (`MAJOR.MINOR.PATCH`):
* **MAJOR**: Incompatible API changes, breaking database migrations, or major architectural overhauls.
* **MINOR**: New user features added in a backwards-compatible manner (e.g. adding project filtering).
* **PATCH**: Backwards-compatible bug fixes and security hotfixes.

### Synchronizing Native Android Versions
Before generating a release binary, update `android/app/build.gradle`:
```groovy
defaultConfig {
    versionCode 2         // Monotonically increasing positive integer
    versionName "1.1.0"   // Semver string matching latest release
}
```

---

## 2. Release Checklist

1. [ ] Ensure all local changes are committed on branch `tech2place-react-native`.
2. [ ] Run full automated test suite:
   ```bash
   npm test
   ```
3. [ ] Bump `versionCode` and `versionName` in `{app}/android/app/build.gradle`.
4. [ ] Verify release signing environment variables:
   * `KEYSTORE_PATH`
   * `KEYSTORE_STORE_PASSWORD`
   * `KEYSTORE_KEY_ALIAS`
   * `KEYSTORE_KEY_PASSWORD`
5. [ ] Build the Android App Bundle (AAB):
   ```bash
   cd {app}/android && ./gradlew clean bundleRelease
   ```
6. [ ] Upload the resulting `.aab` file to Google Play Console:
   * Location: `{app}/android/app/build/outputs/bundle/release/app-release.aab`
7. [ ] Deploy to **Internal Testing Track** first, then promote to **Production Track**.

---

## 3. Remote Force-Update Management

Once a new version is published to the Google Play Store, configure remote force-update rules from the **Admin Console** without requiring any code changes or redeployments:

1. Open **Admin Console** -> **Menu** -> **App Releases & Maintenance**.
2. Select target application (**Student**, **Client**, or **Admin**).
3. Set **Latest Version** to the newly published version (e.g. `1.1.0`).
4. Set **Minimum Version**:
   * If the previous version contains critical bugs or security vulnerabilities, set **Minimum Version** to `1.1.0`. All users on older versions will immediately be prompted with a non-dismissible update screen directing them to the Google Play Store.
   * If the release is backwards-compatible, keep **Minimum Version** at `1.0.0` and select **Update Mode** = `flexible` or `optional`.
5. Tap **Save Release Configuration**. Changes propagate in real time across the ecosystem.

---

## 4. Emergency Maintenance Mode Protocol

In the event of database migrations or critical backend outages:

1. In Admin Console -> **App Releases & Maintenance**, toggle **Maintenance Mode** to **ON**.
2. Enter a user-friendly status message:
   ```text
   TECH2PLACE is undergoing scheduled system upgrades. Please check back in 30 minutes.
   ```
3. Tap **Save**. All active sessions will immediately transition to the branded `MaintenanceScreen`, preventing any read/write operations until maintenance is disabled.
