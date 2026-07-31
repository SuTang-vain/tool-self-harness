const router = require('express').Router();
const users = require('../repos/users');
router.patch('/', async (req, res) => {
  const updated = await users.update(req.user.id, req.body);
  return res.json(updated);
});
module.exports = router;
