'use strict';
var express = require('express');
var config = require('../config');
var object = require('../controllers/types/object');

var router = express.Router({
  mergeParams: true
});

router.get('/', object.index);
router.get('/thumbnail', object.thumbnail);

module.exports = router;
