import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AsyncIter } from '../../src/main';

beforeEach((t) => {
  setTimeout(() => t.signal.dispatchEvent(new Event('abort')), 100);
});

describe('AsyncIter.fromSample', () => {
  it('should repeat sample values', async ({ signal }) => {
    assert.deepEqual(
      await AsyncIter.fromSample([1, 2], 1000, signal).take(4).collect(),
      [1, 2, 1, 2]
    );
  });

  it('should handle empty samples', async ({ signal }) => {
    const result = await AsyncIter.fromSample([], 1000, signal)
      .take(3)
      .collect();
    assert.deepEqual(result, []);
  });
});
