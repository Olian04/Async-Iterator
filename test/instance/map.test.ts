import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.map', () => {
  it('should transform values', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .map((x) => x * 2)
        .collect(),
      [2, 4, 6]
    );
  });

  it('should handle async mappers', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .map((x) => x * 2)
        .collect(),
      [2, 4, 6]
    );
  });

  it('should propagate errors from mapper function', async ({ signal }) => {
    await assert.rejects(
      AsyncIter.fromIter([1, 2, 3], signal)
        .map(() => {
          throw new Error('test error');
        })
        .collect(),
      /test error/
    );
  });
});
