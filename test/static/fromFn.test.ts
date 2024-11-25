import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.fromFn', () => {
  it('should generate values from function', async ({ signal }) => {
    let i = 0;
    assert.deepEqual(
      await AsyncIter.fromFn((done) => {
        i++;
        if (i > 2) done();
        return i;
      }, signal).collect(),
      [1, 2]
    );
  });

  it('should handle async functions', async ({ signal }) => {
    let i = 0;
    assert.deepEqual(
      await AsyncIter.fromFn(async (done) => {
        i++;
        if (i > 2) done();
        return i;
      }, signal).collect(),
      [1, 2]
    );
  });

  it('should propagate errors from source function', async ({ signal }) => {
    await assert.rejects(
      AsyncIter.fromFn(() => {
        throw new Error('test error');
      }, signal).collect(),
      /test error/
    );
  });
});
