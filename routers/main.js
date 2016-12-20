'use strict';
const express = require('express');
const router = express.Router();
const config = require('../config');

const searchController = require('../controllers/search');

router.use('/api', require('./api'));

// Requesting a bare catalog (/ES, /DNT, ...) redirects to a search
router.get(/^\/([A-Z]{2,3})$/, searchController.redirect);
router.get(/^\/([A-Z]{2,3})$/, searchController.redirect);

const searchPath = encodeURIComponent(config.search.path);
router.get('/' + searchPath, searchController.redirect);

module.exports = router;
