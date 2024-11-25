import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.append', () => {
  it('should append values to the iterator', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2], signal).append([3, 4]).collect(),
      [1, 2, 3, 4]
    );
  });

  it('should handle empty input', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2], signal).append([]).collect(),
      [1, 2]
    );
  });

  it('should handle appending to empty iterator', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([] as number[], signal)
        .append([1, 2])
        .collect(),
      [1, 2]
    );
  });

  it('should handle async iterables', async ({ signal }) => {
    const asyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield 3;
        yield 4;
      },
    };
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2], signal).append(asyncIterable).collect(),
      [1, 2, 3, 4]
    );
  });
});
