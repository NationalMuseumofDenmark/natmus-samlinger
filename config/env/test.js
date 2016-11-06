'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'test',
  es: {
    host: '172.16.1.222:80',
    assetsIndex: 'test_assets',
    allIndecies: [
      'test_assets',
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
  googleAnalyticsPropertyID: 'UA-2930791-7',
  ip: process.env.IP || '0.0.0.0',
  natmusApiBaseURL: 'http://testapi.natmus.dk/',
  port: process.env.PORT || 9000,
  siteTitle: 'Nationalmuseets Samlinger Online (beta)',
  types: {
    asset: {
      index: 'test_assets'
    },
    object: {
      index: 'new_objects'
    }
  },
  viewsPath: '/views',
});
