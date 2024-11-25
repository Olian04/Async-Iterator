import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype[Symbol.asyncIterator]', () => {
  it('should make instance iterable with for-await-of', async ({ signal }) => {
    const iter = AsyncIter.fromIter([1, 2, 3], signal);
    const results: number[] = [];
    for await (const value of iter) {
      results.push(value);
    }
    assert.deepEqual(results, [1, 2, 3]);
  });

  it('should handle empty iterator', async ({ signal }) => {
    const iter = AsyncIter.fromIter([], signal);
    const results: number[] = [];
    for await (const value of iter) {
      results.push(value);
    }
    assert.deepEqual(results, []);
  });

  it('should propagate errors', async ({ signal }) => {
    const errorIterable = {
      async *[Symbol.asyncIterator]() {
        throw new Error('test error');
      },
    };
    const iter = AsyncIter.fromIter(errorIterable, signal);

    await assert.rejects(async () => {
      for await (const _ of iter) {
        // Should throw before yielding any values
      }
    }, /test error/);
  });

  it('should clean up resources on break', async ({ signal }) => {
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

    const iter = AsyncIter.fromIter(cleanupIterable, signal);
    for await (const _ of iter) {
      break;
    }
    assert.equal(cleaned, true);
  });
});
