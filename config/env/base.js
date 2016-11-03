'use strict';

var path = require('path');
var _ = require('lodash');

var rootPath = path.normalize(__dirname + '/../../..');
var generatedDir = path.join(__dirname, '..', '..', 'generated');
var appDir = path.join(__dirname, '..', '..', 'app');

var cipCatalogs = require('../cip-catalogs.json');

const REVIEW_STATE_FIELD = '{a493be21-0f70-4cae-9394-703eca848bad}';

module.exports = {
  root: rootPath, // TODO: Consider removing this
  appDir: appDir,
  appPaths: [
    generatedDir,
    appDir
  ],
  ip:   process.env.IP || '0.0.0.0',
  port: process.env.PORT || 9000,
  cip: {
    baseURL: 'http://cumulus.natmus.dk/CIP',
    username: process.env.CIP_USERNAME,
    password: process.env.CIP_PASSWORD,
    proxyMaxSockets: 10,
    rotationCategoryName: 'Rotationsbilleder',
    indexing: {
      additionalFields: [
        '{af4b2e71-5f6a-11d2-8f20-0000c0e166dc}', // Related Sub Assets
        '{af4b2e72-5f6a-11d2-8f20-0000c0e166dc}' // Related Master Assets
      ],
      restriction: REVIEW_STATE_FIELD + ' is 3', // Published
    },
    catalogs: cipCatalogs,
    client: {
      endpoint: 'http://cumulus.natmus.dk/CIP/',
      constants: {
        catchAllAlias: 'alle',
        layoutAlias: 'web'
      },
      catalogAliases: _.invert(cipCatalogs),
      // apiVersion: 4,
      serverAddress: 'ppcumulus.natmus.int'
    },
  },
  es: {
    host: process.env.ES_HOST || 'localhost:9200',
    assetsIndex: process.env.ES_ASSETS_INDEX || 'assets',
  },
  features: {
    geotagging: true,
    rotationalImages: true,
    crowdtagging: true,
    clientSideSearchResultRendering: false,
    filterSidebar: false,
    watermarks: false
  },
  generatedDir: generatedDir,
  googleAnalyticsPropertyID: null,
  googleMapsAPIKey: 'AIzaSyCkoZ8EB9Vf5SfXUzMY6bewq6diets-pxU',
  googleAPIKey: process.env.GOOGLE_API_KEY,
  projectOxfordAPIKey: process.env.PROJECT_OXFORD_API_KEY,
  categoryBlacklist: require('../category-blacklist.js'),
  tagsBlacklist: require('../tags-blacklist.json'),
  natmusApiBaseURL: 'http://testapi.natmus.dk/',
  natmusApiVersion: 1,
  natmusApiMaxSockets: 10,
  filterOptions: require('../filter-options.json'),
  sortOptions: require('../sort-options.json'),
  types: ['asset'],
  typeRouters: {
    'asset': 'collections-online/lib/routers/asset'
  },
  assetFields: require('../asset-fields.json'),
  assetLayout: require('../asset-layout.json'),
  licenseMapping: require('../license-mapping.json'),
  themeColor: '#262626',
  appName: 'Samlinger',
};
