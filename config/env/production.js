'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'production',
  google: {
    analyticsPropertyID: 'UA-2930791-3'
  },
  host: 'samlinger.natmus.dk',
  natmus: {
    api: {
      baseURL: 'http://api.natmus.dk'
    }
  },
  siteTitle: 'Nationalmuseets Samlinger Online',
  types: {
    asset: {
      layout: {
        restrictRelated: ['assets']
      }
    }
  }
});
