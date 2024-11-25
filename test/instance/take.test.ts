import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.take', () => {
  it('should take specified number of values', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3, 4], signal).take(2).collect(),
      [1, 2]
    );
  });

  it('should handle taking more than available', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2], signal).take(5).collect(),
      [1, 2]
    );
  });

  it('should handle taking zero', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal).take(0).collect(),
      []
    );
  });
});
