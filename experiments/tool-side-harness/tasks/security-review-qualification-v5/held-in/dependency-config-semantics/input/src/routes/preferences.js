const { mergePreferences } = require('../utils/object');
module.exports = function preferences(req, res) { return res.json(mergePreferences(req.user.settings, req.body)); };
