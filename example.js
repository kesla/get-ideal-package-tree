/* eslint-disable import/no-extraneous-dependencies */

import getIdealPackageTree from 'get-ideal-package-tree';

getIdealPackageTree(['browserify', 'watchify'])
  .then(tree => {
    console.log('ideal dependency tree', tree);
  })
  .catch(err => {
    console.error(err);
  });

/*
There's also a CLI available:

$ get-ideal-package-tree browserify watchify

*/
