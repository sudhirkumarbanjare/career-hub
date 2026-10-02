import test from 'node:test';
import assert from 'node:assert';
import { FirestoreClient } from '../shared/dist/firebase/firestoreClient.js';

test('Universal Firestore Client - Data Layer & Real-Time Sync', async (t) => {
  await t.test('1. Seed cache and query collection', async () => {
    FirestoreClient.seedCache('test_items', [
      { id: 'item_1', name: 'Alpha Item', count: 10 },
      { id: 'item_2', name: 'Beta Item', count: 20 },
    ]);

    const items = await FirestoreClient.queryCollection('test_items');
    assert.strictEqual(items.length, 2);
    assert.strictEqual(items[0].name, 'Alpha Item');
  });

  await t.test('2. Set new document and retrieve by ID', async () => {
    const created = await FirestoreClient.setDocument('test_items', 'item_3', {
      name: 'Gamma Item',
      count: 30,
    });

    assert.strictEqual(created.id, 'item_3');
    assert.strictEqual(created.name, 'Gamma Item');

    const fetched = await FirestoreClient.getDocument('test_items', 'item_3');
    assert.ok(fetched);
    assert.strictEqual(fetched.name, 'Gamma Item');
    assert.strictEqual(fetched.count, 30);
  });

  await t.test('3. Update document fields', async () => {
    await FirestoreClient.updateDocument('test_items', 'item_3', { count: 99 });
    const fetched = await FirestoreClient.getDocument('test_items', 'item_3');
    assert.ok(fetched);
    assert.strictEqual(fetched.count, 99);
  });

  await t.test('4. Real-time subscription triggers upon mutation', async () => {
    let triggeredCount = 0;
    let latestList = [];

    const unsubscribe = FirestoreClient.subscribe('test_items', (docs) => {
      triggeredCount++;
      latestList = docs;
    });

    // Initial trigger happened
    assert.strictEqual(triggeredCount, 1);

    // Mutate collection
    await FirestoreClient.setDocument('test_items', 'item_4', { name: 'Delta Item', count: 40 });

    assert.strictEqual(triggeredCount, 2);
    assert.ok(latestList.some((d) => d.id === 'item_4'));

    unsubscribe();
  });

  await t.test('5. Delete document removes from cache and notifies listeners', async () => {
    await FirestoreClient.deleteDocument('test_items', 'item_4');
    const fetched = await FirestoreClient.getDocument('test_items', 'item_4');
    assert.strictEqual(fetched, null);
  });
});
