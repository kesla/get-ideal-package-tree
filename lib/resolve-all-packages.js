const buildDependencyArray = dependencies => Object.keys(dependencies).map(
  packageName => `${packageName}@${dependencies[packageName]}`);

export default function * (getPackage, input) {
  const packages = {};
  const walk = function * (packageArg) {
    const {name, version, dependencies = {}} = yield getPackage(packageArg);
    const dependencyArray = buildDependencyArray(dependencies);
    packages[packageArg] = {name, version, dependencies: dependencyArray};
    yield dependencyArray.map(walk);
  };

  yield input.map(walk);

  return packages;
}
