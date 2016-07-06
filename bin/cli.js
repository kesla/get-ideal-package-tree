#!/usr/bin/env node

var args = process.argv.slice(2);

var getPackage = require('get-package-json-from-registry')();

require('../dist')(getPackage)(args)
  .then(json => console.log(JSON.stringify(json, null, 2)))
  .catch(err => console.error(err));
