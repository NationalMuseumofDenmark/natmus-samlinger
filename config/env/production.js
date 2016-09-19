'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'production',
  viewsPath: '/views',
  siteTitle: 'Nationalmuseets Samlinger Online',
  es: {
    host: process.env.ES_HOST || '172.16.1.222:80',
    assetsIndex: 'assets',
  },
  natmusApiBaseURL: 'http://api.natmus.dk/',
  enableGeotagging: true,
  googleAnalyticsPropertyID: 'UA-2930791-3'
});
