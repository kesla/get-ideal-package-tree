import 'babel-polyfill';
import {wrap as co} from 'co';

module.exports = getPackage => co(function * (input) {
  const tree = {};

  const walk = function * (packageArgs) {
    const pkgs = yield packageArgs.map(getPackage);
    pkgs.forEach(({name, version}) => {
      tree[name] = {version};
    });

    yield pkgs.map(({dependencies}) => {
      if (!dependencies || Object.keys(dependencies).length === 0) {
        return Promise.resolve(null);
      }

      const childPackageArgs = Object.keys(dependencies).map(pkgName => `${pkgName}@${dependencies[pkgName]}`);
      return walk(childPackageArgs);
    });
  };

  yield walk(input);

  return tree;
});
