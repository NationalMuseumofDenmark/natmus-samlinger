'use strict';

var path = require('path');
var _ = require('lodash');

var rootPath = path.normalize(__dirname + '/../../..');
var generatedDir = path.join(__dirname, '..', '..', 'generated');
var appDir = path.join(__dirname, '..', '..', 'app');

var cipCatalogs = require('../cip-catalogs.json');

const REVIEW_STATE_FIELD = '{a493be21-0f70-4cae-9394-703eca848bad}';

module.exports = {
  appDir: appDir,
  appName: 'Samlinger',
  appPaths: [
    generatedDir,
    appDir
  ],
  assetFields: require('../asset-fields.json'),
  categoryBlacklist: require('../category-blacklist.js'),
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
    assetsIndex: process.env.ES_ASSETS_INDEX || 'assets'
  },
  features: {
    geotagging: true,
    rotationalImages: true,
    crowdtagging: true,
    clientSideSearchResultRendering: true,
    filterSidebar: true,
    watermarks: false
  },
  generatedDir: generatedDir,
  googleAnalyticsPropertyID: null,
  googleAPIKey: process.env.GOOGLE_API_KEY,
  googleMapsAPIKey: 'AIzaSyCkoZ8EB9Vf5SfXUzMY6bewq6diets-pxU',
  ip: process.env.IP || '0.0.0.0',
  licenseMapping: require('../license-mapping.json'),
  natmusApiBaseURL: 'http://testapi.natmus.dk/',
  natmusApiMaxSockets: 10,
  natmusApiVersion: 1,
  port: process.env.PORT || 9000,
  projectOxfordAPIKey: process.env.PROJECT_OXFORD_API_KEY,
  root: rootPath, // TODO: Consider removing this
  search: {
    path: 'søg',
    filters: require('../filters.json'),
  },
  sortOptions: require('../sort-options.json'),
  tagsBlacklist: require('../tags-blacklist.json'),
  themeColor: '#262626',
  types: {
    asset: {
      layout: require('../layouts/asset.json')
    },
    object: {
      router: path.join(__dirname, '..', '..', 'routers', 'object'),
      layout: require('../layouts/object.json')
    }
  }
};
