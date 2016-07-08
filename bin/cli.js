#!/usr/bin/env node

var args = process.argv.slice(2);

require('../dist')(args)
  .then(json => console.log(JSON.stringify(json, null, 2)))
  .catch(err => console.error(err));
