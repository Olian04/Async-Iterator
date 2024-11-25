import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.fromSequence', () => {
  it('should generate sequential values', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromSequence(1, 2, signal).take(3).collect(),
      [1, 3, 5]
    );
  });
});
