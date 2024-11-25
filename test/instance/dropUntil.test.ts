import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.dropUntil', () => {
  it('should drop values until predicate becomes true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3, 4, 5], signal)
        .dropUntil((x) => x > 3)
        .collect(),
      [4, 5]
    );
  });

  it('should handle predicate never becoming true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .dropUntil(() => false)
        .collect(),
      []
    );
  });

  it('should handle predicate starting true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .dropUntil(() => true)
        .collect(),
      [1, 2, 3]
    );
  });
});
