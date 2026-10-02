import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { NavigationStackManager } from '../shared/dist/utils/navigation.js';

describe('Navigation Stack Manager & Back-Press Logic Tests', () => {
  let navManager;

  beforeEach(() => {
    navManager = new NavigationStackManager();
  });

  test('1. Initial stack state is empty', () => {
    assert.strictEqual(navManager.depth(), 0);
    assert.strictEqual(navManager.canGoBack(), false);
    assert.strictEqual(navManager.current(), null);
  });

  test('2. Push and Pop multi-level navigation hierarchy (Home -> Projects -> Detail -> Booking)', () => {
    // Navigate from tab to Project Detail
    navManager.push('project-detail', { id: 'proj_ai_vision' });
    assert.strictEqual(navManager.depth(), 1);
    assert.strictEqual(navManager.canGoBack(), true);
    assert.strictEqual(navManager.current().name, 'project-detail');
    assert.strictEqual(navManager.current().params.id, 'proj_ai_vision');

    // Navigate deeper to Project Booking
    navManager.push('project-booking', { id: 'proj_ai_vision' });
    assert.strictEqual(navManager.depth(), 2);
    assert.strictEqual(navManager.current().name, 'project-booking');

    // First Back (pops Project Booking -> reveals Project Detail)
    const poppedBooking = navManager.pop();
    assert.strictEqual(poppedBooking.name, 'project-booking');
    assert.strictEqual(navManager.depth(), 1);
    assert.strictEqual(navManager.current().name, 'project-detail');
    assert.strictEqual(navManager.canGoBack(), true);

    // Second Back (pops Project Detail -> reveals root tab)
    const poppedDetail = navManager.pop();
    assert.strictEqual(poppedDetail.name, 'project-detail');
    assert.strictEqual(navManager.depth(), 0);
    assert.strictEqual(navManager.canGoBack(), false);
  });

  test('3. Replace screen maintains stack depth', () => {
    navManager.push('job-detail', { id: 'job_react_native_01' });
    assert.strictEqual(navManager.depth(), 1);

    navManager.replace('job-detail', { id: 'job_flutter_02' });
    assert.strictEqual(navManager.depth(), 1);
    assert.strictEqual(navManager.current().params.id, 'job_flutter_02');
  });

  test('4. Clear / PopToTop returns cleanly to root', () => {
    navManager.push('screen1');
    navManager.push('screen2');
    navManager.push('screen3');
    assert.strictEqual(navManager.depth(), 3);

    navManager.popToTop();
    assert.strictEqual(navManager.depth(), 1);
    assert.strictEqual(navManager.current().name, 'screen1');

    navManager.clear();
    assert.strictEqual(navManager.depth(), 0);
    assert.strictEqual(navManager.current(), null);
  });

  test('5. Tab Switching resets stack', () => {
    navManager.push('my-applications');
    assert.strictEqual(navManager.depth(), 1);

    // User switches bottom tab to 'courses'
    navManager.clear();
    assert.strictEqual(navManager.depth(), 0);
  });
});
