import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.reduce', () => {
  it('should reduce values with accumulator', async ({ signal }) => {
    assert.equal(
      await AsyncIter.fromIter([1, 2, 3], signal).reduce(
        0,
        (acc, x) => acc + x
      ),
      6
    );
  });

  it('should handle async reducer function', async ({ signal }) => {
    assert.equal(
      await AsyncIter.fromIter([1, 2, 3], signal).reduce(
        0,
        (acc, x) => acc + x
      ),
      6
    );
  });

  it('should return initial value for empty iterator', async ({ signal }) => {
    assert.equal(
      await AsyncIter.fromIter([], signal).reduce(10, (acc, x) => acc + x),
      10
    );
  });

  it('should handle complex accumulator types', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromIter([1, 2, 3], signal).reduce(
        [] as number[],
        (acc, x) => [...acc, x * 2]
      ),
      [2, 4, 6]
    );
  });
});
