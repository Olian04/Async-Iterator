/**
 * An async iterator implementation with focus on memory usage when iterating over collections that are bigger than what can be held in memory at once.
 */
export class AsyncIter<const T> implements AsyncIterable<T> {
  private iterator: AsyncIterable<T>;
  private constructor(
    iterator: Iterable<T> | AsyncIterable<T>,
    private signal?: AbortSignal
  ) {
    this.iterator = (async function* () {
      for await (const it of iterator) {
        if (signal?.aborted) {
          break;
        }
        yield it;
      }
    })();
  }

  /**
   * Returns an async iterator.
   * @returns An async iterator.
   */
  public [Symbol.asyncIterator](): AsyncIterator<T> {
    const iterator = this.iterator;
    const signal = this.signal;
    return (async function* () {
      for await (const it of iterator) {
        if (signal?.aborted) {
          break;
        }
        yield it;
      }
    })();
  }

  /**
   * Zips two iterables together.
   * @param iterA The first iterable.
   * @param iterB The second iterable.
   * @returns An async iterator that yields pairs of elements from the two iterables.
   */
  static zip<A, B>(
    iterA: AsyncIterable<A> | Iterable<A>,
    iterB: AsyncIterable<B> | Iterable<B>,
    signal?: AbortSignal
  ): AsyncIter<[A, B]> {
    return AsyncIter.fromGeneratorFn(async function* () {
      const iterableB =
        Symbol.iterator in iterB
          ? iterB[Symbol.iterator]()
          : iterB[Symbol.asyncIterator]();
      for await (const itA of iterA) {
        const itB = await iterableB.next();
        if (itB.done) {
          break;
        }
        yield [itA, itB.value];
      }
      await iterableB.return?.();
    }, signal);
  }

  /**
   * Joins two iterables together.
   * @param iterA The first iterable.
   * @param iterB The second iterable.
   * @returns An async iterator that yields elements from the two iterables in sequence.
   */
  static join<T>(
    iterA: AsyncIterable<T> | Iterable<T>,
    iterB: AsyncIterable<T> | Iterable<T>,
    signal?: AbortSignal
  ): AsyncIter<T> {
    return AsyncIter.fromGeneratorFn(async function* () {
      yield* iterA;
      yield* iterB;
    }, signal);
  }

  /**
   * Interleaves two iterables.
   * @param iterA The first iterable.
   * @param iterB The second iterable.
   * @returns An async iterator that yields elements from the two iterables in sequence.
   */
  static interleave<T>(
    iterA: AsyncIterable<T> | Iterable<T>,
    iterB: AsyncIterable<T> | Iterable<T>,
    signal?: AbortSignal
  ): AsyncIter<T> {
    return AsyncIter.zip(iterA, iterB, signal).then(async function* (self) {
      for await (const [a, b] of self) {
        yield a;
        yield b;
      }
    });
  }

  /**
   * Creates an async iterator from an iterable.
   * @param iterator The iterable to create an async iterator from.
   * @returns An async iterator.
   */
  static fromIter<T>(
    iterator: AsyncIterable<T> | Iterable<T>,
    signal?: AbortSignal
  ): AsyncIter<T> {
    return new AsyncIter(iterator, signal);
  }

  /**
   * Creates an async iterator from a generator function.
   * @param generator The generator function to create an async iterator from.
   * @returns An async iterator.
   */
  static fromGeneratorFn<T>(
    generator: () => AsyncGenerator<T> | Generator<T>,
    signal?: AbortSignal
  ): AsyncIter<T> {
    return new AsyncIter(generator(), signal);
  }

  /**
   * Creates an async iterator from a function that yields values.
   * The function is called repeatedly until the done callback is called.
   * @param fn The function to create an async iterator from.
   * @returns An async iterator.
   */
  static fromFn<T>(
    fn: (done: () => void) => T | Promise<T>,
    signal?: AbortSignal
  ): AsyncIter<T> {
    return AsyncIter.fromGeneratorFn(async function* () {
      let isDone = false;
      while (!isDone) {
        const val = await fn(() => {
          isDone = true;
        });
        if (!isDone) {
          yield val;
        }
      }
    }, signal);
  }

  /**
   * Creates an async iterator from a sample.
   * The iterator will yield elements from the sample until the sample is exhausted, after which it will yield elements from the sample in a loop.
   * @param sample The sample to create an async iterator from.
   * @returns An async iterator.
   */
  static fromSample<T>(
    sample: AsyncIterable<T> | Iterable<T>,
    maxSampleSize: number = 1000,
    signal?: AbortSignal
  ): AsyncIter<T> {
    return AsyncIter.fromGeneratorFn(async function* () {
      const buffer = [];

      for await (const it of sample) {
        if (buffer.length >= maxSampleSize) {
          throw new Error(
            `Sample size exceeds maximum buffer size of ${maxSampleSize}`
          );
        }
        buffer.push(it);
        yield it;
      }

      while (true) {
        yield* buffer;
      }
    }, signal);
  }

  /**
   * Creates an async iterator that yields a sequence of numbers.
   * @param start The start of the sequence.
   * @param step The step between numbers.
   * @returns An async iterator.
   */
  static fromSequence(
    start: number,
    step: number,
    signal?: AbortSignal
  ): AsyncIter<number> {
    let value = start;
    return AsyncIter.fromFn(() => {
      const val = value;
      const nextValue = value + step;
      if (!Number.isSafeInteger(nextValue)) {
        throw new Error('Sequence value exceeded safe integer bounds');
      }
      value = nextValue;
      return val;
    }, signal);
  }

  /**
   * Creates a new async iterator by applying a generator function to the current iterator.
   * @param generator The generator function to apply to the current iterator.
   * @returns A new async iterator.
   */
  public then<V>(
    generator: (iter: AsyncIterable<T>) => AsyncGenerator<V> | Generator<V>
  ): AsyncIter<V> {
    return AsyncIter.fromIter(generator(this.iterator), this.signal);
  }

  /**
   * Runs the iterator without collecting any values.
   */
  public async run(): Promise<void> {
    if (this.signal?.aborted) {
      return;
    }
    for await (const _ of this.iterator) {
      if (this.signal?.aborted) {
        break;
      }
    }
  }

  /**
   * Collects the values of the iterator into an array.
   * @returns An array of values.
   */
  public async collect(): Promise<T[]> {
    if (this.signal?.aborted) {
      return [];
    }
    const arr = [];
    for await (const it of this.iterator) {
      if (this.signal?.aborted) {
        break;
      }
      arr.push(it);
    }
    return arr;
  }

  /**
   * Reduces the iterator to a single value.
   * @param initialValue The initial value.
   * @param fn The function to apply to the iterator.
   * @returns The reduced value.
   */
  public async reduce<V>(
    initialValue: V,
    fn: (acc: V, it: T) => V
  ): Promise<V> {
    if (this.signal?.aborted) {
      return initialValue;
    }
    let val = initialValue;
    for await (const it of this.iterator) {
      if (this.signal?.aborted) {
        break;
      }
      val = fn(val, it);
    }
    return val;
  }

  /**
   * Appends an iterator to the current iterator.
   * @param iter The iterator to append.
   * @returns A new async iterator.
   */
  public append(iter: AsyncIterable<T> | Iterable<T>): AsyncIter<T> {
    return this.then(async function* (self) {
      yield* self;
      yield* iter;
    });
  }

  /**
   * Prepends an iterator to the current iterator.
   * @param iter The iterator to prepend.
   * @returns A new async iterator.
   */
  public prepend(iter: AsyncIterable<T> | Iterable<T>): AsyncIter<T> {
    return this.then(async function* (self) {
      yield* iter;
      yield* self;
    });
  }

  /**
   * Applies a function to each element of the iterator in order to produce a new iterator.
   * @param fn The function to apply to the iterator.
   * @returns A new async iterator.
   */
  public map<V>(fn: (it: T) => V | Promise<V>): AsyncIter<V> {
    return this.then(async function* (self) {
      for await (const it of self) {
        yield fn(it);
      }
    });
  }

  /**
   * Applies a function to each element of the iterator.
   * @param fn The function to apply to the iterator.
   * @returns A new async iterator.
   */
  public forEach(fn: (it: T) => unknown): AsyncIter<T> {
    return this.then(async function* (self) {
      for await (const it of self) {
        fn(it);
        yield it;
      }
    });
  }

  /**
   * Filters the iterator.
   * @param predicate The predicate to filter the iterator.
   * @returns A new async iterator.
   */
  public filter(predicate: (it: T) => boolean): AsyncIter<T> {
    return this.then(async function* (self) {
      for await (const it of self) {
        if (predicate(it)) {
          yield it;
        }
      }
    });
  }

  /**
   * Takes the first `count` elements from the iterator, then drops the rest.
   * @param count The number of elements to take.
   * @returns A new async iterator.
   */
  public take(count: number): AsyncIter<T> {
    let i = 0;
    return this.then(async function* (self) {
      if (count === 0) {
        return;
      }
      for await (const it of self) {
        yield it;
        if (++i >= count) {
          break;
        }
      }
    });
  }

  /**
   * Takes elements from the iterator until the predicate is true, then drops the rest.
   * @param predicate The predicate to take elements until.
   * @returns A new async iterator.
   */
  public takeUntil(predicate: (it: T) => boolean): AsyncIter<T> {
    return this.takeWhile((it) => !predicate(it));
  }

  /**
   * Takes elements from the iterator while the predicate is true, then drops the rest.
   * @param predicate The predicate to take elements while.
   * @returns A new async iterator.
   */
  public takeWhile(predicate: (it: T) => boolean): AsyncIter<T> {
    return this.then(async function* (self) {
      for await (const it of self) {
        if (!predicate(it)) {
          break;
        }
        yield it;
      }
    });
  }

  /**
   * Drops the first `count` elements from the iterator, then yields the rest.
   * @param count The number of elements to drop.
   * @returns A new async iterator.
   */
  public drop(count: number): AsyncIter<T> {
    let i = 0;
    return this.then(async function* (self) {
      for await (const it of self) {
        if (i++ < count) {
          continue;
        }
        yield it;
      }
    });
  }

  /**
   * Drops elements from the iterator until the predicate is true, then yields the rest.
   * @param predicate The predicate to drop elements until.
   * @returns A new async iterator.
   */
  public dropUntil(predicate: (it: T) => boolean): AsyncIter<T> {
    return this.dropWhile((it) => !predicate(it));
  }

  /**
   * Drops elements from the iterator while the predicate is true, then yields the rest.
   * @param predicate The predicate to drop elements while.
   * @returns A new async iterator.
   */
  public dropWhile(predicate: (it: T) => boolean): AsyncIter<T> {
    return this.then(async function* (self) {
      let dropping = true;
      for await (const it of self) {
        if (dropping && predicate(it)) {
          continue;
        }
        dropping = false;
        yield it;
      }
    });
  }
}
