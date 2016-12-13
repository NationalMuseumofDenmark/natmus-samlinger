'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  allowRobots: false,
  env: 'test',
  googleAnalyticsPropertyID: 'UA-2930791-7',
  ip: process.env.IP || '0.0.0.0',
  natmusApiBaseURL: 'http://testapi.natmus.dk/',
  port: process.env.PORT || 9000,
  siteTitle: 'Nationalmuseets Samlinger Online (beta)',
  viewsPath: '/views',
});
