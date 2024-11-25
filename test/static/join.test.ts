import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.join', () => {
  it('should combine two iterators in sequence', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.join([1, 2], [3, 4], signal).collect(),
      [1, 2, 3, 4]
    );
  });

  it('should handle empty first iterator', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.join([], [1, 2], signal).collect(),
      [1, 2]
    );
  });

  it('should handle empty second iterator', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.join([1, 2], [], signal).collect(),
      [1, 2]
    );
  });

  it('should handle both empty iterators', async ({ signal }) => {
    assert.deepEqual(await AsyncIter.join([], [], signal).collect(), []);
  });

  it('should handle async iterables', async ({ signal }) => {
    const asyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield 3;
        yield 4;
      },
    };
    assert.deepEqual(
      await AsyncIter.join([1, 2], asyncIterable, signal).collect(),
      [1, 2, 3, 4]
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
        yield 3;
        yield 4;
      },
    };
    assert.deepEqual(
      await AsyncIter.join(asyncIterableA, asyncIterableB, signal).collect(),
      [1, 2, 3, 4]
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
    await AsyncIter.join(cleanupIterable, [], signal).take(1).collect();
    assert.equal(cleaned, true);
  });
});
