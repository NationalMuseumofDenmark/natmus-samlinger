'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'development',
  googleAnalyticsPropertyID: 'no-please',
  siteTitle: 'Nationalmuseets Samlinger Online (dev)',
  types: {
    asset: {
      index: 'new_assets'
    },
    object: {
      index: 'new_objects'
    }
  },
  viewsPath: '/app/views',
});
