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
    packages[packageArg] = {name, version, dependencies};
    yield entries(dependencies).map(([packageName, version]) => walk(toArg({
      packageName, version
    })));
  };

  yield input.map(walk);

  return packages;
}
