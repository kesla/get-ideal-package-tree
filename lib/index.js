import 'babel-polyfill';
import {wrap as co} from 'co';
import resolveAllPackages from './resolve-all-packages';
import {map} from 'immutable-object-methods';

const fix = ({version, dependencies}) => {
  if (!Object.keys(dependencies).length) {
    return {version};
  }

  return {
    version,
    dependencies: map(dependencies, (value) => fix(value))
  };
};

module.exports = getPackage => co(function * (input) {
  const packages = yield resolveAllPackages(getPackage, input);
  const root = {dependencies: {}, root: true};

  const findAncestor = (name, version, pkg) => {
    if (pkg.root) {
      return pkg;
    }

    // dependency earlier in the tree
    if (pkg.parent.dependencies[name]) {
      return pkg.parent.dependencies[name].version === version ? null : pkg;
    }

    // continue if not circular dependencies
    if (pkg.parent.name !== name) {
      return findAncestor(name, version, pkg.parent);
    }

    return pkg.parent.version === version ? null : pkg;
  };

  const queue = input.sort().map(row => ({
    row, pkg: root
  }));

  while (queue.length > 0) {
    const {row, pkg} = queue.shift();
    const {name, version, dependencies} = packages[row];
    const ancestor = findAncestor(name, version, pkg);
    if (!ancestor) {
      continue;
    }

    ancestor.dependencies[name] = {version, dependencies: {}, parent: ancestor, name};
    dependencies.sort().forEach(row => {
      queue.push({
        row, pkg: ancestor.dependencies[name]
      });
    });
  }

  return fix(root).dependencies || {};
});
