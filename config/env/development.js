'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'development',
  es: {
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
  googleAnalyticsPropertyID: 'no-please',
  siteTitle: 'Nationalmuseets Samlinger Online (dev)',
  viewsPath: '/app/views',
});
