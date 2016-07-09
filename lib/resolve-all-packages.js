import entries from 'object.entries';
import toArg from './to-arg';

export default function * (getPackage, input) {
  const resolved = new Set();
  const packages = {};
  const walk = function * (packageArg) {
    if (resolved.has(packageArg)) {
      return;
    }
    resolved.add(packageArg);
    const {name, version, dependencies = {}} = yield getPackage(packageArg);
    // resolve both arguments like foo@^1.2.0 & foo@1.3.5
    packages[packageArg] = packages[toArg({packageName: name, version})] = {name, version, dependencies};
    yield entries(dependencies).map(([packageName, version]) => walk(toArg({
      packageName, version
    })));
  };

  yield input.map(walk);

  return packages;
}
