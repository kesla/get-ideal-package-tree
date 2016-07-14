import getPackage from 'get-pkg-json';
import inject from './inject';

module.exports = input => inject(getPackage)(input);
module.exports.inject = inject;
