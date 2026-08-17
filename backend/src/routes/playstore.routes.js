
// const router = require('express').Router();
// const { suggestions, search } = require('../controllers/playstore.controller');

// router.get('/suggestions', suggestions);
// router.get('/search', search);

// module.exports = router;

const router = require('express').Router();
const { suggestions, search, appDetails } = require('../controllers/playstore.controller');

router.get('/suggestions', suggestions);
router.get('/search', search);
router.get('/details', appDetails);

module.exports = router;