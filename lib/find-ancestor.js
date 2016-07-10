import {getIn} from 'immutable-object-methods';
import toArg from './to-arg';

export default ({packages}) => {
  const findAncestor = (name, version, pkg) => {
    if (pkg.root) {
      return pkg;
    }

    const {parent} = pkg;

    // check is parent resolves to the dependency
    if (parent.dependencies[name]) {
      return parent.dependencies[name].version === version ? null : pkg;
    }

    // if the parent originally depends on another version we should
    // insert the new package
    if (!parent.root) {
      const packageArg = toArg({packageName: parent.name, version: parent.version});
      const dependencyVersion = getIn(packages, [packageArg, 'dependencies', name]);

      if (dependencyVersion && dependencyVersion !== version) {
        return pkg;
      }
    }

    // continue if not circular dependencies
    if (parent.name !== name) {
      return findAncestor(name, version, parent);
    }

    return parent.version === version ? null : pkg;
  };
  return findAncestor;
};
