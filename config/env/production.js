'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  enableGeotagging: true,
  env: 'production',
  es: {
    host: process.env.ES_HOST || '172.16.1.222:80'
  },
  googleAnalyticsPropertyID: 'UA-2930791-3',
  natmusApiBaseURL: 'http://api.natmus.dk/',
  siteTitle: 'Nationalmuseets Samlinger Online',
  types: {
    asset: {
      index: 'assets'
    },
    object: {
      index: 'new_objects'
    }
  },
  viewsPath: '/views',
});
