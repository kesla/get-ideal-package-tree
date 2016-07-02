import 'babel-polyfill';
import test from 'tapava';
import getIdealPackageTree from './lib';

const shouldNotBeCalled = () => { throw new Error('should not be called'); };
const setupGetPackage = obj => key => Promise.resolve(obj[key]);

test('empty array', function * (t) {
  const actual = yield getIdealPackageTree(shouldNotBeCalled)([]);
  const expected = [];
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
  const expected = [
    {
      name: '@scope/bas',
      version: '1.2.0',
      dependencies: []
    }, {
      name: 'bar',
      version: '3.0.0',
      dependencies: []
    }, {
      name: 'foo',
      version: '1.0.0',
      dependencies: []
    }
  ];
  t.deepEqual(actual, expected);
});
