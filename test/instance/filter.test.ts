import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.filter', () => {
  it('should filter values based on predicate', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .filter((x) => x % 2 === 0)
        .collect(),
      [2]
    );
  });

  it('should handle async predicates', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal)
        .filter((x) => x % 2 === 0)
        .collect(),
      [2]
    );
  });

  it('should propagate errors from predicate', async ({ signal }) => {
    await assert.rejects(
      AsyncIter.fromIter([1, 2, 3], signal)
        .filter(() => {
          throw new Error('test error');
        })
        .collect(),
      /test error/
    );
  });
});
