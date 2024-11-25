import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.prepend', () => {
  it('should prepend values to the iterator', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([3, 4], signal).prepend([1, 2]).collect(),
      [1, 2, 3, 4]
    );
  });

  it('should handle empty input', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2], signal).prepend([]).collect(),
      [1, 2]
    );
  });

  it('should handle prepending to empty iterator', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([] as number[], signal)
        .prepend([1, 2])
        .collect(),
      [1, 2]
    );
  });

  it('should handle async iterables', async ({ signal }) => {
    const asyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield 1;
        yield 2;
      },
    };
    assert.deepEqual(
      await AsyncIter.fromIter([3, 4], signal).prepend(asyncIterable).collect(),
      [1, 2, 3, 4]
    );
  });
});
