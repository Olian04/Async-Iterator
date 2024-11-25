import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.collect', () => {
  it('should collect all values into array', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal).collect(),
      [1, 2, 3]
    );
  });

  it('should handle empty iterator', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([], signal).collect(),
      []
    );
  });

  it('should handle async values', async ({ signal }) => {
    const asyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield 1;
        yield 2;
        yield 3;
      }
    };
    assert.deepEqual(
      await AsyncIter.fromIter(asyncIterable, signal).collect(),
      [1, 2, 3]
    );
  });
}); 