import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.then', () => {
  it('should transform iterator with async function', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .then(async function* (iter) {
          for await (const x of iter) {
            yield x * 2;
          }
        })
        .collect(),
      [2, 4, 6]
    );
  });

  it('should handle empty iterator', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([], signal)
        .then(async function* (iter) {
          for await (const x of iter) {
            yield x;
          }
        })
        .collect(),
      []
    );
  });

  it('should propagate errors', async ({ signal }) => {
    await assert.rejects(
      AsyncIter.fromIter([1, 2, 3], signal)
        .then(async function* () {
          throw new Error('test error');
        })
        .collect(),
      /test error/
    );
  });
});
