const { rawSearch } = require('../db/search');
module.exports = async function search(req, res) { return res.json(await rawSearch(req.query.q)); };
