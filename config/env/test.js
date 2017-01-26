'use strict';

var _ = require('lodash');
var base = require('./base');

delete base.natmus.api.baseQuery.bool.must;

module.exports = _.merge(base, {
  allowRobots: false,
  env: 'test',
  googleAnalyticsPropertyID: 'UA-2930791-7',
  natmus: {
    api: {
      baseURL: 'http://testapi.natmus.dk',
      baseQuery: base.natmus.api.baseQuery
    }
  },
  siteTitle: 'Nationalmuseets Samlinger Online (beta)'
});
