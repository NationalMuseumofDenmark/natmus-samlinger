'use strict';

var _ = require('lodash');

if (process.env.NODE_ENV) {
  const env = process.env.NODE_ENV;
  console.log('Loading ' + env + ' configuration');
  var config = require('./env/' + env + '.js');
}

/**
 * Load environment configuration
 */
module.exports = config;
