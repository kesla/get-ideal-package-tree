import 'babel-polyfill';
import test from 'tapava';
import getIdealPackageTree from './lib';
import assert from 'assert';

const shouldNotBeCalled = () => { throw new Error('should not be called'); };
const setupGetPackage = obj => key => {
  assert(obj[key], `${key} exists in ${JSON.stringify(obj)}`);
  return Promise.resolve(obj[key]);
};

test('empty array', function * (t) {
  const actual = yield getIdealPackageTree(shouldNotBeCalled)([]);
  const expected = {};
  t.deepEqual(actual, expected);
});

test('packages w no dependencies', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {name: 'foo', version: '1.0.0', extra: true},
    'bar@latest': {name: 'bar', version: '3.0.0', dependencies: [], extra: true},
    '@scope/bas@1.2.0': {name: '@scope/bas', version: '1.2.0', extra: true}
  }));
  const actual = yield getIdealPackageTree(getPackage)([
    'foo', '@scope/bas@1.2.0', 'bar@latest'
  ]);
  const expected = {
    '@scope/bas': {
      version: '1.2.0'
    },
    bar: {
      version: '3.0.0'
    },
    foo: {
      version: '1.0.0'
    }
  };
  t.deepEqual(actual, expected);
});

test('packages w nested dependencies that are all unique', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {name: 'foo', version: '1.0.0', dependencies: {
      bar: '^2.0.0'
    }},
    'bar@^2.0.0': {name: 'bar', version: '2.1.2', dependencies: {
      bas: '~1.0.0'
    }},
    'bas@~1.0.0': {name: 'bas', version: '1.0.5'}
  }));
  const actual = yield getIdealPackageTree(getPackage)(['foo']);
  const expected = {
    foo: {version: '1.0.0'},
    bar: {version: '2.1.2'},
    bas: {version: '1.0.5'}
  };
  t.deepEqual(actual, expected);
});
