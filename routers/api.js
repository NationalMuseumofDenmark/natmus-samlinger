'use strict';
const express = require('express');
const router = express.Router();

const api = require('../controllers/api');

router
  .post('/:action', api.proxy)
  .post('/:index/:action', api.proxy);

router
  .route('/*')
  .get(api.proxy)
  .post(api.proxy);

module.exports = router;
