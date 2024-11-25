import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.prototype.forEach', () => {
  it('should execute function for each value', async ({ signal }) => {
    const results: number[] = [];
    await AsyncIter.fromIter([1, 2, 3], signal)
      .forEach((x) => results.push(x))
      .collect();
    assert.deepEqual(results, [1, 2, 3]);
  });

  it('should handle async functions', async ({ signal }) => {
    const results: number[] = [];
    await AsyncIter.fromIter([1, 2, 3], signal)
      .forEach(async (x) => results.push(x))
      .collect();
    assert.deepEqual(results, [1, 2, 3]);
  });

  it('should handle empty iterator', async ({ signal }) => {
    const results: number[] = [];
    await AsyncIter.fromIter([], signal)
      .forEach((x) => results.push(x))
      .collect();
    assert.deepEqual(results, []);
  });

  it('should propagate errors', async ({ signal }) => {
    await assert.rejects(
      AsyncIter.fromIter([1, 2, 3], signal)
        .forEach(() => {
          throw new Error('test error');
        })
        .collect(),
      /test error/
    );
  });
});
