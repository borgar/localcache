# localcache

Promise compatible function memoizer. Requires Promise and Map to be available.


## Install

```
$ npm install @borgar/localcache
```


## Usage

```js
import cache from '@borgar/localcache';

const fetchUserInfo = cache(function (username) {
  return fetch("https://api.example.com/userinfo/" + username)
    .then(response => {
      if (!response.ok) { throw new Error(response.status); }
      return response.json();
    });
}, 60);
```

A useful feature of localcache is that if the wrapped function returns a promise, all cached responses will be the same pending promise instance. That means that a web application may request the same URL multiple times and when the data arrives, all awaiting will get the result concurrently.


## API

### localcache(function, options?)

#### input

Type: `function`

The function to wrapped.

#### options

Type: `object`
Default: `{ lifetime: 900, idresolve: <defaultIdresolver>, bootstrap: null }`

The time in seconds the result should be cached. By default localcache hangs on to old data for 15 minutes.


##### options.lifetime

Type: `number`
Default: `900`

The time in seconds the result should be cached. By default localcache hangs on to old data for 15 minutes.


##### options.bootstrap

Type: `array | null`
Default: `null`

An array of objects containing keys: id, result.  id is the cache key which should match the argument of the cached function & result is the cached value. e.g.

```js
import cache from '@borgar/localcache';

const bootstrap = [{ id: '', result: 5, { id: 'some-other-arg', result: 2} ]
const functionToReturnCachedValue = localCache(function functionToCache (arg) { return 5 }, { bootstrap });

functionToReturnCachedValue()
// returns 5
turnCachedValue('some-other-arg')
// returns 2
turnCachedValue('not-bootsrapped')
// returns 5
```

##### options.idresolver

Type: `function`

A function which identifies the input. By default localcache will simply string join the arguments which means that wrapping functions that accept input requires you to create your own identities to key them on.

It may be as simple as this:

```js
import cache from '@borgar/localcache';

function loadFile (fileinfo) {
  // load a file named fileinfo.filename from fileinfo.path
}

const maybeLoadFile = localCache(loadFile, { lifetime: 60, idresolver: fileinfo => {
  return fileinfo.path + '/' + fileinfo.filename;
}});
```

