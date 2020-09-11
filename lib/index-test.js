/* global setTimeout process */
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
  }, { lifetime: 0.1 });
  testFn().then(d => t.is(d, 1));
  setTimeout(() => testFn().then(d => t.is(d, 2)), 120);
  setTimeout(() => testFn().then(d => t.is(d, 3)), 240);
});

test('Bootstrap cache with inital values', t => {
  t.plan(2);
  let count = 0;
  const testFn2 = cache(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        count++;
        resolve(count);
      }, 1);
    });
  }, { bootstrap: [ { id: '', result: 6 } ] });
  testFn2().then(d => t.is(d, 6));
  setTimeout(() => testFn2().then(d => t.is(d, 6)), 120);
});


if (typeof process !== 'undefined') {
  test('Ensure chain makes sense', t => {
    t.plan(1);
    process.on('unhandledRejection', () => t.fail());
    cache(() => Promise.reject())()
      .then(() => t.fail('wrong way'))
      .catch(() => t.ok(true));
  });
}
