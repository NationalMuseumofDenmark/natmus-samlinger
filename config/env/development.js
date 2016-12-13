'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'development',
  googleAnalyticsPropertyID: 'no-please',
  natmus: {
    api: {
      baseURL: 'http://testapi.natmus.dk'
    }
  },
  siteTitle: 'Nationalmuseets Samlinger Online (dev)',
  viewsPath: '/app/views',
});
