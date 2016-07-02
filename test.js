import 'babel-polyfill';
import test from 'tapava';
import getIdealPackageTree from './lib';

const shouldNotBeCalled = () => { throw new Error('should not be called'); };

test('empty array', function * (t) {
  const actual = yield getIdealPackageTree(shouldNotBeCalled)([]);
  const expected = {};
  t.deepEqual(actual, expected);
});
