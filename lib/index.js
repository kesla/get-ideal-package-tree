import 'babel-polyfill';
import {wrap as co} from 'co';
import sortBy from 'lodash.sortby';

module.exports = getPackage => co(function * (packageArgs) {
  const packages = yield packageArgs.map(getPackage);
  return sortBy(packages.map(({name, version, dependencies = []}) => ({
    name, version, dependencies
  })), 'name');
});
