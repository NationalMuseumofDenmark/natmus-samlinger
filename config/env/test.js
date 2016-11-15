'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  allowRobots: false,
  env: 'test',
  es: {
    host: '172.16.1.222:80'
  },
  googleAnalyticsPropertyID: 'UA-2930791-7',
  ip: process.env.IP || '0.0.0.0',
  natmusApiBaseURL: 'http://testapi.natmus.dk/',
  port: process.env.PORT || 9000,
  siteTitle: 'Nationalmuseets Samlinger Online (beta)',
  types: {
    asset: {
      index: 'new_assets'
    },
    object: {
      index: 'new_objects'
    }
  },
  viewsPath: '/views',
});
