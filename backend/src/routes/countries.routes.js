const router = require('express').Router();
const { all, byName } = require('../controllers/countries.controller');

router.get('/', all);
router.get('/:name', byName);

module.exports = router;