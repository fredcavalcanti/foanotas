var express = require('express');
var router = express.Router();
var { getData } = require('../controllers/index');

router.get('/', async (req, res, next) => res.render('../views/index.html'));
router.post('/data', getData);

module.exports = router;
