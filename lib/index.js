import 'babel-polyfill';
import {wrap as co} from 'co';
import resolveAllPackages from './resolve-all-packages';

module.exports = getPackage => co(function * (input) {
  const packages = yield resolveAllPackages(getPackage, input);
  const root = {};

  const flatten = rows => {
    rows.forEach(row => {
      const {name, version, dependencies} = packages[row];
      root[name] = {version};
      flatten(dependencies);
    });
  };

  flatten(input);

  return root;
});
