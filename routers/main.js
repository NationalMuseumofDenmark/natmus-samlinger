'use strict';
const express = require('express');
const router = express.Router();
const config = require('../config');
const querystring = require('querystring');

const searchController = require('../controllers/search');

router.use('/api', require('./api'));

// Requesting a bare catalog (/ES, /DNT, ...) redirects to a search
router.get(/^\/([A-Z]{2,3})$/, searchController.redirect);

// Redirecting assets
router.get(/^\/([A-Z]{2,3})\/(\d+)(\/.*)?$/, (req, res) => {
  let catalog = req.params[0];
  let id = req.params[1];
  let rest = req.params[2] || '';
  res.redirect('/' + catalog + '/asset/' + id + rest, 301);
});

const searchPath = encodeURIComponent(config.search.path);
router.get('/' + searchPath, searchController.redirect);

module.exports = router;
