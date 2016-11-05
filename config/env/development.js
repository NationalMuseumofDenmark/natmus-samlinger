'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'development',
  es: {
    allIndecies: [
      'assets'
      //'new_assets',
      //'new_objects'
    ]
  },
  googleAnalyticsPropertyID: 'no-please',
  siteTitle: 'Nationalmuseets Samlinger Online (dev)',
  viewsPath: '/app/views',
});
