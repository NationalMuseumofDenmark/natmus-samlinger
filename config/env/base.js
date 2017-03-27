'use strict';

var path = require('path');
var _ = require('lodash');

var rootPath = path.normalize(__dirname + '/../../..');
var childPath = path.normalize(path.join(__dirname, '..', '..'));

var cipCatalogs = require('../cip-catalogs.json');

const REVIEW_STATE_FIELD = '{a493be21-0f70-4cae-9394-703eca848bad}';

module.exports = {
  childPath: childPath,
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
  cloudinaryUrl: process.env.CLOUDINARY_URL || false,
  downloadOptions: require('../download-options'),
  features: {
    clientSideSearchResultRendering: true,
    filterSidebar: true,
    geoTagging: true,
    keystone: true,
    motifTagging: true,
    rotationalImages: true,
    scrollToTop: false,
    watermarks: false
  },
  googleAnalyticsPropertyID: null,
  googleAPIKey: process.env.GOOGLE_API_KEY,
  googleMapsAPIKey: 'AIzaSyCkoZ8EB9Vf5SfXUzMY6bewq6diets-pxU',
  ip: process.env.IP || '0.0.0.0',
  keystone: {
    options: {
      'auto update': true,
      'updates': path.join(__dirname, '..', '..', 'updates'),
      'mongo': process.env.MONGO_CONNECTION || 'mongodb://localhost/natmus',
      'session store': 'mongo',
      'auth': true,
      'user model': 'User',
      'cookie secret': process.env.COOKIE_SECRET || 'not-a-secret',
      'wysiwyg additional buttons': 'styleselect, blockquote',
      'wysiwyg importcss': '/styles/keystone-tiny-mce.css'
    }
  },
  licenseMapping: require('../license-mapping.json'),
  motifTagging: {
    userField: '{73be3a90-a8ef-4a42-aa8f-d16ca4f55e0a}',
    visionField: '{6864395c-c433-2148-8b05-56edf606d4d4}'
  },
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
    path: 'search',
    filters: require('../filters.json'),
    baseQuery: {
      'bool': {
        'should': [
          {
            'term': {
              'type': 'asset'
            }
          }, {
            'exists': {
              'field': 'related.assets'
            }
          }
        ],
        'must_not': [
          { // Filtering out side shots of rotation images
            'range': {
              'meta.rotation': {
                'gt': 1
              }
            }
          }, {
            'term': {
              'meta.cropping': 'source'
            }
          }, {
            // Leave out objects from the AS collection
            'bool': {
              'must': [
                {
                  'term': {
                    'collection.keyword': 'AS'
                  }
                }, {
                  'term': {
                    'type.keyword': 'object'
                  }
                }
              ]
            }
          }, {
            // Leave out the "flmlibrary" collection
            'term': {
              'collection.keyword': 'flmlibrary'
            }
          }, {
            // Leave out the "DODMR" collection
            'term': {
              'collection.keyword': 'DODMR'
            }
          }, {
            // Leave out assets from the MUM collection
            'bool': {
              'must': [
                {
                  'term': {
                    'collection.keyword': 'MUM'
                  }
                }, {
                  'term': {
                    'type.keyword': 'asset'
                  }
                }
              ]
            }
          }, {
            // Leave out assets from the KMM collection
            'bool': {
              'must': [
                {
                  'term': {
                    'collection.keyword': 'KMM'
                  }
                }, {
                  'term': {
                    'type.keyword': 'asset'
                  }
                }
              ]
            }
          }
        ]
      }
    }
  },
  sortOptions: require('../sort-options.json'),
  tagsBlacklist: require('../tags-blacklist.json'),
  themeColor: '#262626',
  translations: require('../translations'),
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
