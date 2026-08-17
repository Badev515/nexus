
const router = require('express').Router();
const { interest, related } = require('../controllers/trends.controller');

router.get('/interest', interest);
router.get('/related', related);

module.exports = router;