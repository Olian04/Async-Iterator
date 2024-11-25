import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.fromGeneratorFn', () => {
  it('should create iterator from generator function', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromGeneratorFn(function* () {
        yield 1;
        yield 2;
        yield 3;
      }, signal).collect(),
      [1, 2, 3]
    );
  });

  it('should handle async generator function', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromGeneratorFn(async function* () {
        yield 1;
        yield 2;
        yield 3;
      }, signal).collect(),
      [1, 2, 3]
    );
  });

  it('should handle empty generator', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromGeneratorFn(function* () {}, signal).collect(),
      []
    );
  });

  it('should propagate errors', async ({ signal }) => {
    await assert.rejects(
      AsyncIter.fromGeneratorFn(async function* () {
        throw new Error('test error');
      }, signal).collect(),
      /test error/
    );
  });
});
