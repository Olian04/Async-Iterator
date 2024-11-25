import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.zip', () => {
  it('should combine two iterators into pairs', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.zip([1, 2, 3], [4, 5, 6], signal).collect(),
      [
        [1, 4],
        [2, 5],
        [3, 6],
      ]
    );
  });

  it('should stop when shortest iterator is exhausted', async ({ signal }) => {
    assert.deepEqual(await AsyncIter.zip([1, 2, 3], [4, 5], signal).collect(), [
      [1, 4],
      [2, 5],
    ]);
  });

  it('should handle empty iterators', async ({ signal }) => {
    assert.deepEqual(await AsyncIter.zip([], [1, 2, 3], signal).collect(), []);
  });

  it('should handle async iterables', async ({ signal }) => {
    const asyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield 1;
        yield 2;
      },
    };
    assert.deepEqual(
      await AsyncIter.zip(asyncIterable, [4, 5], signal).collect(),
      [
        [1, 4],
        [2, 5],
      ]
    );
  });

  it('should handle both async iterables', async ({ signal }) => {
    const asyncIterableA = {
      async *[Symbol.asyncIterator]() {
        yield 1;
        yield 2;
      },
    };
    const asyncIterableB = {
      async *[Symbol.asyncIterator]() {
        yield 4;
        yield 5;
      },
    };
    assert.deepEqual(
      await AsyncIter.zip(asyncIterableA, asyncIterableB, signal).collect(),
      [
        [1, 4],
        [2, 5],
      ]
    );
  });

  it('should properly clean up resources on early termination', async ({
    signal,
  }) => {
    let cleaned = false;
    const cleanupIterable = {
      async *[Symbol.asyncIterator]() {
        try {
          yield 1;
          yield 2;
        } finally {
          cleaned = true;
        }
      },
    };
    await AsyncIter.zip(cleanupIterable, [4], signal).collect();
    assert.equal(cleaned, true);
  });
});
