import assert from 'assert';

import test from 'tapava';
import {set} from 'immutable-object-methods';
import npa from 'npm-package-arg';

import resolveAllPackages from '../lib/resolve-all-packages';

const setupGetPackage = obj => key => {
  const pkg = obj[key];
  assert(pkg, `${key} exists in ${JSON.stringify(obj)}`);

  return Promise.resolve(set(pkg, '_requested', npa(key)));
};

test('resolveAllPackages() packages w nested dependencies that are all unique', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {name: 'foo', version: '1.0.0', dependencies: {
      bar: '^2.0.0'
    }},
    'bar@^2.0.0': {name: 'bar', version: '2.1.2', dependencies: {
      bas: '~1.0.0'
    }},
    'bas@~1.0.0': {name: 'bas', version: '1.0.5'}
  }));
  const actual = yield resolveAllPackages(getPackage, ['foo']);
  const expected = {
    foo: {name: 'foo', version: '1.0.0', dependencies: {bar: '^2.0.0'}, bundleDependencies: []},
    'foo@1.0.0': {name: 'foo', version: '1.0.0', dependencies: {bar: '^2.0.0'}, bundleDependencies: []},
    'bar@^2.0.0': {name: 'bar', version: '2.1.2', dependencies: {bas: '~1.0.0'}, bundleDependencies: []},
    'bar@2.1.2': {name: 'bar', version: '2.1.2', dependencies: {bas: '~1.0.0'}, bundleDependencies: []},
    'bas@~1.0.0': {name: 'bas', version: '1.0.5', dependencies: {}, bundleDependencies: []},
    'bas@1.0.5': {name: 'bas', version: '1.0.5', dependencies: {}, bundleDependencies: []}
  };
  t.deepEqual(actual, expected);
});

test('resolveAllPackages() cycle', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {name: 'foo', version: '1.0.0', dependencies: {
      bar: '2.0.0'
    }},
    'foo@1.0.0': {name: 'foo', version: '1.0.0', dependencies: {
      bar: '2.0.0'
    }},
    'bar@2.0.0': {name: 'bar', version: '2.0.0', dependencies: {
      foo: '1.0.0'
    }}
  }));
  const actual = yield resolveAllPackages(getPackage, ['foo']);
  const expected = {
    foo: {
      dependencies: {bar: '2.0.0'},
      name: 'foo',
      version: '1.0.0',
      bundleDependencies: []
    },
    'bar@2.0.0': {
      dependencies: {foo: '1.0.0'},
      name: 'bar',
      version: '2.0.0',
      bundleDependencies: []
    },
    'foo@1.0.0': {
      dependencies: {bar: '2.0.0'},
      name: 'foo',
      version: '1.0.0',
      bundleDependencies: []
    }
  };
  t.deepEqual(actual, expected);
});

test('resolveAllPackages() w bundleDependencies', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {
      name: 'foo',
      version: '1.0.0',
      dependencies: {bar: '1.0.0'},
      bundleDependencies: ['bar']
    }
  }));
  const actual = yield resolveAllPackages(getPackage, ['foo']);
  const expected = {
    foo: {dependencies: {bar: '1.0.0'}, bundleDependencies: ['bar'], name: 'foo', version: '1.0.0'},
    'foo@1.0.0': {dependencies: {bar: '1.0.0'}, bundleDependencies: ['bar'], name: 'foo', version: '1.0.0'}
  };
  t.deepEqual(actual, expected);
});

test('resolveAllPackages() packages w github', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    'users/package#branch': {name: 'foo', version: '1.0.0', dependencies: {
      bar: '^2.0.0'
    }},
    'bar@^2.0.0': {name: 'bar', version: '2.1.2', dependencies: {
      bas: '~1.0.0'
    }},
    'bas@~1.0.0': {name: 'bas', version: '1.0.5'}
  }));
  const actual = yield resolveAllPackages(getPackage, ['users/package#branch']);
  const expected = {
    'users/package#branch': {name: 'foo', version: 'github:users/package#branch', dependencies: {bar: '^2.0.0'}, bundleDependencies: []},
    'foo@github:users/package#branch': {name: 'foo', version: 'github:users/package#branch', dependencies: {bar: '^2.0.0'}, bundleDependencies: []},
    'bar@^2.0.0': {name: 'bar', version: '2.1.2', dependencies: {bas: '~1.0.0'}, bundleDependencies: []},
    'bar@2.1.2': {name: 'bar', version: '2.1.2', dependencies: {bas: '~1.0.0'}, bundleDependencies: []},
    'bas@~1.0.0': {name: 'bas', version: '1.0.5', dependencies: {}, bundleDependencies: []},
    'bas@1.0.5': {name: 'bas', version: '1.0.5', dependencies: {}, bundleDependencies: []}
  };
  t.deepEqual(actual, expected);
});
