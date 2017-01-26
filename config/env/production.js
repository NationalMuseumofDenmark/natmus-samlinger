'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'production',
  googleAnalyticsPropertyID: 'UA-2930791-3',
  natmus: {
    api: {
      baseURL: 'http://api.natmus.dk'
    }
  },
  siteTitle: 'Nationalmuseets Samlinger Online'
});
