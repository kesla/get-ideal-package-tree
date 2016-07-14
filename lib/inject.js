import resolveAllPackages from './resolve-all-packages';
import toArg from './to-arg';
import setupFindAncestor from './find-ancestor';

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

export default getPackage => input =>
  resolveAllPackages(getPackage, input).then(packages => {
    const root = {dependencies: {}, bundleDependencies: [], root: true};
    const findAncestor = setupFindAncestor({packages});

    const queue = input.sort().map(arg => ({
      arg, pkg: root
    }));

    while (queue.length > 0) {
      const {arg, pkg} = queue.shift();
      const {name, version, dependencies, bundleDependencies} = packages[arg];
      const ancestor = findAncestor(name, version, pkg);
      if (!ancestor) {
        continue;
      }

      ancestor.dependencies[name] = {version, dependencies: {}, parent: ancestor, name};
      Object.keys(dependencies)
        .filter(packageName => !bundleDependencies.includes(packageName))
        .sort()
        .forEach(packageName => {
          const arg = toArg({packageName, version: dependencies[packageName]});
          queue.push({
            arg, pkg: ancestor.dependencies[name]
          });
        });
    }

    return fix(root).dependencies || {};
  });
