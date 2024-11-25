import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.drop', () => {
  it('should drop specified number of values', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3, 4], signal).drop(2).collect(),
      [3, 4]
    );
  });

  it('should handle dropping more than available', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2], signal).drop(5).collect(),
      []
    );
  });

  it('should handle dropping zero', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal).drop(0).collect(),
      [1, 2, 3]
    );
  });
}); 