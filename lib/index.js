import 'babel-polyfill';
import {wrap as co} from 'co';
import resolveAllPackages from './resolve-all-packages';
import setupGetPackage from 'get-package-json-from-registry';
import toArg from './to-arg';

const fix = ({version, dependencies}) => {
  const names = Object.keys(dependencies).sort();

  if (names.length === 0) {
    return {version};
  }

  const deps = {};
  names.forEach(name => {
    deps[name] = fix(dependencies[name]);
  });
  return {version, dependencies: deps};
};

const inject = getPackage => co(function * (input) {
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

  const queue = input.sort().map(arg => ({
    arg, pkg: root
  }));

  while (queue.length > 0) {
    const {arg, pkg} = queue.shift();
    const {name, version, dependencies} = packages[arg];
    const ancestor = findAncestor(name, version, pkg);
    if (!ancestor) {
      continue;
    }

    ancestor.dependencies[name] = {version, dependencies: {}, parent: ancestor, name};
    Object.keys(dependencies).sort().forEach(packageName => {
      const arg = toArg({packageName, version: dependencies[packageName]});
      queue.push({
        arg, pkg: ancestor.dependencies[name]
      });
    });
  }

  return fix(root).dependencies || {};
});

module.exports = input => inject(setupGetPackage())(input);
module.exports.inject = inject;
