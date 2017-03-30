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

module.exports = config;
