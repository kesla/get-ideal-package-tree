import getPackage from 'get-package-json-from-registry';
import inject from './inject';

module.exports = input => inject(getPackage)(input);
module.exports.inject = inject;
