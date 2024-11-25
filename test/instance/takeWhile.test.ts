import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.takeWhile', () => {
  it('should take values while predicate is true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3, 2, 1], signal)
        .takeWhile(x => x < 3)
        .collect(),
      [1, 2]
    );
  });

  it('should take no elements if predicate starts false', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .takeWhile(() => false)
        .collect(),
      []
    );
  });

  it('should take all elements if predicate always true', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .takeWhile(() => true)
        .collect(),
      [1, 2, 3]
    );
  });
}); 