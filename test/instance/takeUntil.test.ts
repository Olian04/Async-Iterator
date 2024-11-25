import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.takeUntil', () => {
  it('should take values until predicate becomes true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3, 4, 5], signal)
        .takeUntil((x) => x > 3)
        .collect(),
      [1, 2, 3]
    );
  });

  it('should handle predicate never becoming true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .takeUntil(() => false)
        .collect(),
      [1, 2, 3]
    );
  });

  it('should handle predicate starting true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .takeUntil(() => true)
        .collect(),
      []
    );
  });
});
