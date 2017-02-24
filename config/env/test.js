'use strict';

var _ = require('lodash');
var base = require('./base');

const config = _.merge({}, base, {
  allowRobots: false,
  env: 'test',
  googleAnalyticsPropertyID: 'UA-2930791-7',
  host: 'beta.samlinger.natmus.dk',
  natmus: {
    api: {
      baseURL: 'http://testapi.natmus.dk'
    }
  },
  siteTitle: 'Nationalmuseets Samlinger Online (beta)'
});

// Delete the part of the base query that filters out objects
delete config.search.baseQuery.bool.must;

module.exports = config;
