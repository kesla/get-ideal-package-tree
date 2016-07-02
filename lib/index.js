import 'babel-polyfill';
import {wrap as co} from 'co';

module.exports = ({getPackage}) => co(function * (packages) {
  const tree = {};
  return tree;
});
