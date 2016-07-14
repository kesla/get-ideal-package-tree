import entries from 'object.entries';
import toArg from './to-arg';

export default (getPackage, input) => {
  const resolved = new Set();
  const packages = {};
/*  const walk = function * (packageArg) {
    if (resolved.has(packageArg)) {
      return;
    }
    resolved.add(packageArg);
    const {name, version, dependencies = {}, bundleDependencies = []} = yield getPackage(packageArg);

    // resolve both arguments like foo@^1.2.0 & foo@1.3.5
    const pkg = {name, version, dependencies, bundleDependencies};
    packages[packageArg] = packages[toArg({packageName: name, version})] = pkg;

    yield entries(dependencies)
      .filter(([packageName]) => !bundleDependencies.includes(packageName))
      .map(([packageName, version]) => walk(toArg({
        packageName, version
      })));
  };

  yield input.map(walk);*/

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
