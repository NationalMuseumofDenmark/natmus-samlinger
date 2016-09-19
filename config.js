'use strict';

var _ = require('lodash');

// If no NODE_ENV was specified, we are in development
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

console.log('Loading ' + process.env.NODE_ENV + ' configuration');
module.exports = require('./config/env/' + process.env.NODE_ENV);
