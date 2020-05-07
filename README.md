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

### localcache(function, ttl?, idresolver?)

#### input

Type: `function`

The function to wrapped.

#### ttl

Type: `number`
Default: `900`

The time in seconds the result should be cached. By default localcache hangs on to old data for 15 minutes.

#### idresolver

Type: `function`

A function which identifies the input. By default localcache will simply string join the arguments which means that wrapping functions that accept input requires you to create your own identities to key them on.

It may be as simple as this:

```js
import cache from '@borgar/localcache';

function loadFile (fileinfo) {
  // load a file named fileinfo.filename from fileinfo.path
}

const maybeLoadFile = localCache(loadFile, 60, fileinfo => {
  return fileinfo.path + '/' + fileinfo.filename;
});
```

