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
    allIndecies: [
      'assets',
      'dev_mom_objects_public',
      'dev_es_objects_public',
      'dev_as_objects_public',
      'dev_fhm_objects_public',
      'dev_dnt_objects_public',
      'dev_kmm_objects_public',
      'dev_mus_objects_public',
      'dev_flm_objects_public'
    ]
  },
  natmusApiBaseURL: 'http://api.natmus.dk/',
  enableGeotagging: true,
  googleAnalyticsPropertyID: 'UA-2930791-3'
});
