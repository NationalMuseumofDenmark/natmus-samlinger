'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  enableGeotagging: true,
  env: 'production',
  googleAnalyticsPropertyID: 'UA-2930791-3',
  natmusApiBaseURL: 'http://api.natmus.dk/',
  siteTitle: 'Nationalmuseets Samlinger Online',
  viewsPath: '/views',
});
