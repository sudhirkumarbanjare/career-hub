import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DeviceService } from '../shared/dist/services/deviceService.js';
import { AnalyticsService } from '../shared/dist/services/analyticsService.js';

describe('Device Activity, Session & Firebase Analytics Tracking System', () => {
  beforeEach(() => {
    DeviceService.resetState();
    AnalyticsService.clearUserId();
    AnalyticsService.clearLogs();
  });

  test('Scenario 1: Fresh Installation & Device Identity Initialization', () => {
    const installId = DeviceService.getInstallationId();
    assert.ok(installId.startsWith('inst_'), 'Installation ID should use app-scoped UUID format');
    assert.strictEqual(installId.includes(':'), false, 'Should not contain hardware MAC colons');
    assert.strictEqual(/^[a-zA-Z0-9_-]+$/.test(installId), true, 'Valid safe identifier characters');

    // Register initial app launch
    const launchRecord = DeviceService.registerAppLaunch({
      appId: 'student',
      appName: 'GoTechPlace Student',
      appVersion: '1.0.0',
    });

    assert.strictEqual(launchRecord.deviceId, installId);
    assert.strictEqual(launchRecord.appId, 'student');
    assert.strictEqual(launchRecord.appName, 'GoTechPlace Student');
    assert.strictEqual(launchRecord.isLoggedIn, false);
    assert.strictEqual(launchRecord.sessionStatus, 'active');
    assert.strictEqual(launchRecord.deviceStatus, 'active');
    assert.ok(launchRecord.firstSeenAt);
    assert.ok(launchRecord.lastActiveAt);

    // Verify analytics events
    const events = AnalyticsService.getRecentEvents();
    const eventNames = events.map((e) => e.eventName);
    assert.ok(eventNames.includes('app_first_open'), 'Should log app_first_open on first install');
    assert.ok(eventNames.includes('app_open'), 'Should log app_open on launch');
  });

  test('Scenario 2: Device Metadata Extraction & Display Name', () => {
    const meta = DeviceService.collectDeviceMetadata('client', 'GoTechPlace Employer', '1.0.0');
    assert.ok(meta.manufacturer, 'Manufacturer should be present');
    assert.ok(meta.model, 'Model should be present');
    assert.ok(meta.displayName, 'Display name should combine manufacturer and model safely');
    assert.ok(meta.osVersion, 'OS version should be present');
    assert.ok(meta.locale, 'Locale should be present');
    assert.ok(meta.timezone, 'Timezone should be present');
  });

  test('Scenario 3: User Login & Session Attachment', () => {
    const userUid = 'usr_student_test_101';
    const role = 'student';
    const fcmToken = 'fcm_token_sample_abc123';

    // 1. Initial launch
    DeviceService.registerAppLaunch({
      appId: 'student',
      appName: 'GoTechPlace Student',
      appVersion: '1.0.0',
    });

    // 2. User logs in
    const deviceRecord = DeviceService.recordLogin(userUid, role, fcmToken);

    assert.strictEqual(deviceRecord.uid, userUid);
    assert.strictEqual(deviceRecord.role, 'student');
    assert.strictEqual(deviceRecord.isLoggedIn, true);
    assert.strictEqual(deviceRecord.sessionStatus, 'active');
    assert.strictEqual(deviceRecord.fcmToken, fcmToken);
    assert.strictEqual(deviceRecord.isFcmActive, true);
    assert.ok(deviceRecord.lastLoginAt);

    // Verify Analytics user ID and properties
    const events = AnalyticsService.getRecentEvents();
    const loginEvent = events.find((e) => e.eventName === 'login_success');
    assert.ok(loginEvent, 'Should emit login_success analytics event');
    assert.strictEqual(loginEvent.userId, userUid, 'Analytics user ID must match Firebase UID');
    assert.strictEqual(loginEvent.params.app_role, 'student');
  });

  test('Scenario 4: User Logout & Historical Device Preservation', () => {
    const userUid = 'usr_client_test_202';
    DeviceService.registerAppLaunch({ appId: 'client', appName: 'GoTechPlace Client', appVersion: '1.0.0' });
    DeviceService.recordLogin(userUid, 'client', 'fcm_client_token');

    // Perform explicit logout
    const loggedOutRecord = DeviceService.recordLogout(userUid);

    assert.ok(loggedOutRecord);
    assert.strictEqual(loggedOutRecord.isLoggedIn, false);
    assert.strictEqual(loggedOutRecord.sessionStatus, 'logged_out');
    assert.ok(loggedOutRecord.lastLogoutAt);
    assert.strictEqual(loggedOutRecord.isFcmActive, false, 'FCM token should be deactivated on logout');

    // Historical record must still exist in user registry
    const userDevices = DeviceService.getUserDevices(userUid);
    assert.strictEqual(userDevices.length, 1);
    assert.strictEqual(userDevices[0].uid, userUid);
    assert.strictEqual(userDevices[0].isLoggedIn, false);

    // Verify analytics logout event and user ID reset
    const events = AnalyticsService.getRecentEvents();
    const logoutEvent = events.find((e) => e.eventName === 'logout');
    assert.ok(logoutEvent, 'Should log logout event');
  });

  test('Scenario 5: Account Switching on Same Physical Device (User A -> Logout -> User B)', () => {
    const deviceId = DeviceService.getInstallationId();
    const userA = 'usr_student_alice';
    const userB = 'usr_student_bob';

    // 1. User A logs in on Device
    DeviceService.recordLogin(userA, 'student', 'fcm_token_alice');
    let devicesA = DeviceService.getUserDevices(userA);
    assert.strictEqual(devicesA.length, 1);
    assert.strictEqual(devicesA[0].isLoggedIn, true);

    // 2. User A logs out
    DeviceService.recordLogout(userA);
    devicesA = DeviceService.getUserDevices(userA);
    assert.strictEqual(devicesA[0].isLoggedIn, false);
    assert.strictEqual(devicesA[0].sessionStatus, 'logged_out');

    // 3. User B logs in on same device
    DeviceService.recordLogin(userB, 'student', 'fcm_token_bob');
    const devicesB = DeviceService.getUserDevices(userB);

    assert.strictEqual(devicesB.length, 1);
    assert.strictEqual(devicesB[0].deviceId, deviceId, 'Device ID remains the same physical installation');
    assert.strictEqual(devicesB[0].uid, userB, 'Device record attached to User B');
    assert.strictEqual(devicesB[0].isLoggedIn, true);
    assert.strictEqual(devicesB[0].fcmToken, 'fcm_token_bob');

    // 4. Verify User A cannot see User B data or be marked logged in
    const finalDevicesA = DeviceService.getUserDevices(userA);
    assert.strictEqual(finalDevicesA[0].isLoggedIn, false, 'User A session must remain closed');
    assert.strictEqual(finalDevicesA[0].fcmToken, 'fcm_token_alice');
  });

  test('Scenario 6: Multi-Device Login per User (User on Device 1, Device 2, Device 3)', () => {
    const multiUserUid = 'usr_power_user_303';

    // Device 1 (Phone)
    DeviceService.setInstallationId('inst_phone_pixel8_001');
    DeviceService.recordLogin(multiUserUid, 'student', 'fcm_token_device_1');

    // Device 2 (Tablet)
    DeviceService.setInstallationId('inst_tablet_samsung_002');
    DeviceService.recordLogin(multiUserUid, 'student', 'fcm_token_device_2');

    // Device 3 (Work Device)
    DeviceService.setInstallationId('inst_phone_oneplus_003');
    DeviceService.recordLogin(multiUserUid, 'student', 'fcm_token_device_3');

    const allUserDevices = DeviceService.getUserDevices(multiUserUid);
    assert.strictEqual(allUserDevices.length, 3, 'User should have 3 distinct active device records');

    const deviceIds = allUserDevices.map((d) => d.deviceId);
    assert.ok(deviceIds.includes('inst_phone_pixel8_001'));
    assert.ok(deviceIds.includes('inst_tablet_samsung_002'));
    assert.ok(deviceIds.includes('inst_phone_oneplus_003'));

    allUserDevices.forEach((dev) => {
      assert.strictEqual(dev.uid, multiUserUid);
      assert.strictEqual(dev.isLoggedIn, true);
      assert.strictEqual(dev.deviceStatus, 'active');
    });
  });

  test('Scenario 7: Lifecycle Throttling & Background Activity', () => {
    const userUid = 'usr_lifecycle_test';
    DeviceService.setInstallationId('inst_lifecycle_device_001');
    DeviceService.recordLogin(userUid, 'admin');

    const initialRecord = DeviceService.getDeviceDetails(userUid, 'inst_lifecycle_device_001');
    const firstActiveTime = initialRecord?.lastActiveAt;

    // Simulate immediate rapid foreground triggers (within 60s cooldown)
    DeviceService.recordAppForeground();
    DeviceService.recordAppForeground();

    const throttledRecord = DeviceService.getDeviceDetails(userUid, 'inst_lifecycle_device_001');
    assert.strictEqual(throttledRecord?.lastActiveAt, firstActiveTime, 'Should throttle rapid activity writes');

    // Simulate background transition
    DeviceService.recordAppBackground();
    const bgRecord = DeviceService.getDeviceDetails(userUid, 'inst_lifecycle_device_001');
    assert.strictEqual(bgRecord?.sessionStatus, 'background');
  });

  test('Scenario 8: Analytics PII Stripping & Safe Event Logging', () => {
    AnalyticsService.setUserId('usr_secure_999');

    // Try logging an event with forbidden PII keys and values
    const logged = AnalyticsService.logEvent('login_started', {
      app_role: 'student',
      screen_name: 'PhoneLoginScreen',
      phoneNumber: '+919999988888', // Forbidden key
      otp: '123456', // Forbidden key
      password: 'secret_password', // Forbidden key
      rawPhoneValue: '+919876543210', // Forbidden value (phone number regex)
      category: 'admissions', // Allowed key
    });

    assert.strictEqual(logged.params.app_role, 'student');
    assert.strictEqual(logged.params.screen_name, 'PhoneLoginScreen');
    assert.strictEqual(logged.params.category, 'admissions');
    assert.strictEqual(logged.params.phoneNumber, undefined, 'Must strip phone number param');
    assert.strictEqual(logged.params.otp, undefined, 'Must strip OTP param');
    assert.strictEqual(logged.params.password, undefined, 'Must strip password param');
    assert.strictEqual(logged.params.rawPhoneValue, undefined, 'Must strip leaked phone values');
  });

  test('Scenario 9: Admin Device Governance (Status & Details Inspection)', () => {
    const userUid = 'usr_fraud_suspect_404';
    const deviceId = 'inst_compromised_device_777';

    DeviceService.setInstallationId(deviceId);
    DeviceService.recordLogin(userUid, 'client');

    // 1. Admin inspects device
    let dev = DeviceService.getDeviceDetails(userUid, deviceId);
    assert.ok(dev);
    assert.strictEqual(dev.deviceStatus, 'active');

    // 2. Admin blocks / disables device
    const updated = DeviceService.setDeviceStatus(userUid, deviceId, 'disabled');
    assert.strictEqual(updated, true);

    dev = DeviceService.getDeviceDetails(userUid, deviceId);
    assert.strictEqual(dev?.deviceStatus, 'disabled');

    // 3. Admin re-enables device
    DeviceService.setDeviceStatus(userUid, deviceId, 'active');
    dev = DeviceService.getDeviceDetails(userUid, deviceId);
    assert.strictEqual(dev?.deviceStatus, 'active');
  });
});
