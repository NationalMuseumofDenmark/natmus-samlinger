'use strict';

const _ = require('lodash');
const base = require('./base');

const config = _.merge({}, base, {
  env: 'development',
  viewsPath: '/app/views',
  siteTitle: 'Nationalmuseets Samlinger Online (dev)',
  googleAnalyticsPropertyID: 'no-please',
  natmus: {
    api: {
      baseURL: 'http://testapi.natmus.dk'
    }
  },
  siteTitle: 'Nationalmuseets Samlinger Online (dev)'
});

// Delete the part of the base query that filters out objects
delete config.search.baseQuery.bool.must;

module.exports = config;
