# get-ideal-package-tree 

Given a list of packages, returns a JSON representation of the ideal package tree - like how npm@3 would install it.

## Installation

Download node at [nodejs.org](http://nodejs.org) and install it, if you haven't already.

```sh
npm install get-ideal-package-tree --save
```

## Usage

```js
import getIdealPackageTree from 'get-ideal-package-tree';

getIdealPackageTree(['browserify', 'watchify'])
  .then(tree => {
    console.log('ideal dependency tree', tree);
  })
  .catch(err => {
    console.error(err);
  });

/*
There's also a CLI available:

$ get-ideal-package-tree browserify watchify

*/

```

## Tests

```sh
npm install
npm test
```

## Dependencies

- [co](https://github.com/tj/co): generator async control flow goodness
- [get-package-json-from-registry](https://github.com/kesla/get-package-json-from-registry): Get package.json from registry, cached
- [immutable-object-methods](https://github.com/micnews/immutable-object-methods): Update normal plain javascript object, immutable style. Simlar to how immutable.js, seamless-immutable etc does it but a lot smaller and simpler.
- [object.entries](https://github.com/es-shims/Object.entries): ES7 spec-compliant Object.entries shim.

## Dev Dependencies

- [babel-cli](https://github.com/babel/babel/tree/master/packages): Babel command line.
- [babel-core](https://github.com/babel/babel/tree/master/packages): Babel compiler core.
- [babel-preset-es2015-node5](https://github.com/alekseykulikov/babel-preset-es2015-node5): Babel preset to make node@5 fully ES2015 compatible.
- [babel-tape-runner](https://github.com/wavded/babel-tape-runner): Babel + Tape for running your ES Next tests
- [package-json-to-readme](https://github.com/zeke/package-json-to-readme): Generate a README.md from package.json contents
- [semistandard](https://github.com/Flet/semistandard): All the goodness of `feross/standard` with semicolons sprinkled on top.
- [snazzy](https://github.com/feross/snazzy): Format JavaScript Standard Style as Stylish (i.e. snazzy) output
- [tapava](https://github.com/kesla/tapava): the syntax of ava, run through tape


## License

MIT

_Generated by [package-json-to-readme](https://github.com/zeke/package-json-to-readme)_
