const _ = require('lodash');
function mergePreferences(current, input) { return _.merge({}, current, input); }
module.exports = { mergePreferences };
