import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.interleave', () => {
  it('should alternate between iterators', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.interleave([1, 2, 3], [4, 5, 6], signal).collect(),
      [1, 4, 2, 5, 3, 6]
    );
  });

  it('should handle iterators of different lengths', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.interleave([1, 2, 3], [4], signal).collect(),
      [1, 4, 2, 3]
    );
  });

  it('should handle empty iterators', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.interleave([], [1, 2, 3], signal).collect(),
      [1, 2, 3]
    );
  });
});
