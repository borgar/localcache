/* global setTimeout */
/* eslint-disable no-self-compare */
import test from 'tape';
import cache from './';

test('Present and accounted for', t => {
  t.is(typeof cache, 'function');
  t.is(typeof cache(function () {}), 'function');

  // should return a new object every call
  const emitter = () => ({ s: Math.random() });
  t.ok(emitter() !== emitter(), 'no cache');
  // should return the same object every call (for 15 minutes)
  const cachedEmitter = cache(emitter);
  const first = cachedEmitter();
  t.ok(first === cachedEmitter(), 'with cache');
  // clear should mean we get a new object
  cachedEmitter.clearCache();
  t.ok(first !== cachedEmitter(), 'with a clear cache');

  // vary by arguments
  const stringJoin = cache((a, b, c) => [ a, b, c ].join(';'));
  t.is(stringJoin('a', 'b', 'c'), 'a;b;c');
  t.is(stringJoin('x', 'y', 'z'), 'x;y;z');
  t.is(stringJoin(10, true), '10;true;');
  t.is(stringJoin(10, false), '10;false;');

  t.end();
});

test('Promise caching', t => {
  t.plan(3);
  let count = 0;
  const testFn = cache(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        count++;
        resolve(count);
      }, 10);
    });
  }, 5);
  testFn().then(d => t.is(d, 1));
  testFn().then(d => t.is(d, 1));
  testFn().then(d => t.is(d, 1));
});

test('Promise caching expires', t => {
  t.plan(3);
  let count = 0;
  const testFn = cache(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        count++;
        resolve(count);
      }, 1);
    });
  }, 0.1);
  testFn().then(d => t.is(d, 1));
  setTimeout(() => testFn().then(d => t.is(d, 2)), 120);
  setTimeout(() => testFn().then(d => t.is(d, 3)), 240);
});
