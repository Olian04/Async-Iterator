import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.run', () => {
  it('should consume iterator without collecting values', async ({
    signal,
  }) => {
    let count = 0;
    await AsyncIter.fromIter([1, 2, 3], signal)
      .forEach(() => count++)
      .run();
    assert.equal(count, 3);
  });

  it('should handle empty iterator', async ({ signal }) => {
    let count = 0;
    await AsyncIter.fromIter([], signal)
      .forEach(() => count++)
      .run();
    assert.equal(count, 0);
  });

  it('should propagate errors', async ({ signal }) => {
    await assert.rejects(
      AsyncIter.fromIter([1, 2, 3], signal)
        .forEach(() => {
          throw new Error('test error');
        })
        .run(),
      /test error/
    );
  });
});
