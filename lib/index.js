import 'babel-polyfill';
import {wrap as co} from 'co';
import resolveAllPackages from './resolve-all-packages';

const fix = ({version, dependencies}) => {
  const names = Object.keys(dependencies);

  if (!names.length) {
    return {version};
  }

  const deps = {};
  names.forEach(name => {
    deps[name] = fix(dependencies[name]);
  });
  return {version, dependencies: deps};
};

const dedupe = ({dependencies, parent}) => {
  let changed = false;

  Object.keys(dependencies).forEach(key => {
    const obj = dependencies[key];
    if (parent) {
      const parentDep = parent.dependencies[key];
      if (parentDep) {
        if (obj.version === parentDep.version) {
          changed = true;
          delete dependencies[key];
        }
      } else if (!parentDep) {
        changed = true;
        parent.dependencies[key] = obj;
        obj.parent = parent;
        delete dependencies[key];
      }
    }

    changed = changed || dedupe(obj);
  });

  return changed;
};

module.exports = getPackage => co(function * (input) {
  const packages = yield resolveAllPackages(getPackage, input);
  const root = {dependencies: {}};

  const expand = (rows, parent) => {
    rows.forEach(row => {
      const {name, version, dependencies} = packages[row];

      parent.dependencies[name] = {version, dependencies: {}, parent};
      expand(dependencies, parent.dependencies[name]);
    });
  };

  expand(input, root);

  while (dedupe(root));

  return fix(root).dependencies || {};
});
