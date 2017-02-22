'use strict';

var _ = require('lodash');
var base = require('./base');

// Delete the part of the base query that filters out objects
delete base.search.baseQuery.bool.must;

module.exports = _.merge(base, {
  allowRobots: false,
  env: 'test',
  googleAnalyticsPropertyID: 'UA-2930791-7',
  natmus: {
    api: {
      baseURL: 'http://testapi.natmus.dk',
      baseQuery: base.search.baseQuery
    }
  },
  siteTitle: 'Nationalmuseets Samlinger Online (beta)'
});
