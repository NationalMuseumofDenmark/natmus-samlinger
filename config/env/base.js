'use strict';

var path = require('path');
var _ = require('lodash');

var rootPath = path.normalize(__dirname + '/../../..');
var childPath = path.normalize(path.join(__dirname, '..', '..'));

var cipCatalogs = require('../cip-catalogs.json');

const REVIEW_STATE_FIELD = '{a493be21-0f70-4cae-9394-703eca848bad}';

module.exports = {
  childPath: childPath,
  appName: 'Samlinger',
  appPaths: [
    path.join(childPath, 'generated'),
    path.join(childPath, 'app')
  ],
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
  features: {
    geotagging: true,
    rotationalImages: true,
    crowdtagging: true,
    clientSideSearchResultRendering: true,
    filterSidebar: true,
    watermarks: false
  },
  googleAnalyticsPropertyID: null,
  googleAPIKey: process.env.GOOGLE_API_KEY,
  googleMapsAPIKey: 'AIzaSyCkoZ8EB9Vf5SfXUzMY6bewq6diets-pxU',
  ip: process.env.IP || '0.0.0.0',
  licenseMapping: require('../license-mapping.json'),
  translations: require('../../translations'),
  natmus: {
    api: {
      baseURL: 'http://testapi.natmus.dk',
      maxSockets: 10
    }
  },
  port: process.env.PORT || 9000,
  projectOxfordAPIKey: process.env.PROJECT_OXFORD_API_KEY,
  root: rootPath, // TODO: Consider removing this
  search: {
    path: 'søg',
    filters: require('../filters.json'),
    baseQuery: {
      'term': {
        'type': 'asset'
      }
    }
  },
  sortOptions: require('../sort-options.json'),
  tagsBlacklist: require('../tags-blacklist.json'),
  themeColor: '#262626',
  types: {
    asset: {
      layout: require('../layouts/asset.json'),
      mapping: require('../mappings/asset.json')
    },
    object: {
      router: path.join(__dirname, '..', '..', 'routers', 'object'),
      layout: require('../layouts/object.json'),
      mapping: require('../mappings/object.json')
    }
  }
};
