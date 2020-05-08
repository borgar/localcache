const dumbResolver = function (d) { return d.join('//%%//'); };

const SYNC = 0;
const PENDING = 1;
const RESOLVED = 2;
const REJECTED = 3;

const defaultOptions = {
  lifetime: 60 * 15,
  idresolve: dumbResolver,
  bootstrap: null
};

export default function localCache (func, options = {}) {
  options = { ...defaultOptions, ...options };
  if (typeof func !== 'function' || (options.idresolve != null && typeof options.idresolve !== 'function')) {
    throw new TypeError('expected a function');
  }

  const cache = new Map();
  if (Array.isArray(options.bootstrap) && options.bootstrap.length) {
    options.bootstrap.forEach(({ id, result }) => {
      if (typeof id === 'string' && result) {
        const bootstrapExpTime = Date.now() + options.lifetime * 1000;
        cache.set(id, [ bootstrapExpTime, result, RESOLVED, true ]);
      }
      else {
        throw new TypeError('bootstrap arrray should contain object with properties [id, result]');
      }
    });
  }

  const wrapper = function (...args) {
    const id = dumbResolver.call(this, args);
    if (cache.has(id)) {
      const [ expTime, value, state, wasOk ] = cache.get(id);
      if (Date.now() < expTime) {
        if (state === RESOLVED || state === REJECTED) {
          return wasOk ? Promise.resolve(value) : Promise.reject(value);
        }
        return value;
      }
      else {
        cache.delete(id);
      }
    }

    const result = func.apply(this, args);
    const expTime = Date.now() + options.lifetime * 1000;
    // is result a promise?
    if (result && typeof result.then === 'function') {
      result
        .then(value => {
          cache.set(id, [ expTime, value, RESOLVED, true ]);
          return value;
        })
        .catch(error => {
          cache.set(id, [ expTime, error, REJECTED, false ]);
          throw error;
        });
      // set the cache to the promise so next requests hook to the same one
      cache.set(id, [ expTime, result, PENDING, null ]);
    }
    else {
      cache.set(id, [ expTime, result, SYNC, null ]);
    }
    return result;
  };

  wrapper.$cache = cache;
  wrapper.clearCache = () => cache.clear();
  return wrapper;
}
