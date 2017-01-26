'use strict';

var _ = require('lodash');
var base = require('./base');

delete base.search.baseQuery.bool.must;

module.exports = _.merge(base, {
  env: 'development',
  viewsPath: '/app/views',
  siteTitle: 'Nationalmuseets Samlinger Online (dev)',
  googleAnalyticsPropertyID: 'no-please',
  natmus: {
    api: {
      baseURL: 'http://testapi.natmus.dk',
      baseQuery: base.search.baseQuery
    }
  },
  siteTitle: 'Nationalmuseets Samlinger Online (dev)'
});
