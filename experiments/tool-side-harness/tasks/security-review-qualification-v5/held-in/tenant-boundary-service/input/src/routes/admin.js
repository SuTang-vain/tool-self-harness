const router = require('express').Router();
router.use((req, res, next) => req.user.role === 'admin' ? next() : res.sendStatus(403));
router.get('/stats', async (req, res) => res.json(await db.adminStats()));
module.exports = router;
