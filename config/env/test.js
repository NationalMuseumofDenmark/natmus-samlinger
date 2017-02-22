'use strict';

var _ = require('lodash');
var base = require('./base');

var baseQuery = _.cloneDeep(base.search.baseQuery);
// Delete the part of the base query that filters out objects
delete baseQuery.bool.must;

module.exports = _.merge(base, {
  allowRobots: false,
  env: 'test',
  googleAnalyticsPropertyID: 'UA-2930791-7',
  host: 'beta.samlinger.natmus.dk',
  natmus: {
    api: {
      baseURL: 'http://testapi.natmus.dk',
      baseQuery: baseQuery
    }
  },
  siteTitle: 'Nationalmuseets Samlinger Online (beta)'
});
