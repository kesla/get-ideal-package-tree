import entries from 'object.entries';
import toArg from './to-arg';

export default (getPackage, input) => {
  const resolved = new Set();
  const packages = {};

  function walk (packageArg) {
    if (resolved.has(packageArg)) {
      return null;
    }
    resolved.add(packageArg);

    return getPackage(packageArg)
      .then(({name, version, dependencies = {}, bundleDependencies = []}) => {
        const pkg = {name, version, dependencies, bundleDependencies};
        packages[packageArg] = packages[toArg({packageName: name, version})] = pkg;
        return Promise.all(entries(dependencies)
          .filter(([packageName]) => !bundleDependencies.includes(packageName))
          .map(([packageName, version]) => walk(toArg({
            packageName, version
          })))
        );
      });
  }

  return Promise.all(input.map(walk))
    .then(() => packages);
};
