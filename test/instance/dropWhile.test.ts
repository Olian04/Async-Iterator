import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.dropWhile', () => {
  it('should drop values while predicate is true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3, 2, 1], signal)
        .dropWhile(x => x < 3)
        .collect(),
      [3, 2, 1]
    );
  });

  it('should drop all elements if predicate always true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .dropWhile(() => true)
        .collect(),
      []
    );
  });

  it('should keep all elements if predicate starts false', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .dropWhile(() => false)
        .collect(),
      [1, 2, 3]
    );
  });
}); 