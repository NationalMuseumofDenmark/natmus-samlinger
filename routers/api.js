'use strict';
const express = require('express');
const router = express.Router();

const api = require('../controllers/api');

router
  .route('/:index/:action')
  .post(api.proxy);

router
  .route('/*')
  .get(api.proxy)
  .post(api.proxy);

module.exports = router;
