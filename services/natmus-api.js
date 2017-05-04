'use strict';

const assert = require('assert');
const querystring = require('querystring');
const Q = require('q');

const config = require('../config');

if(!config.natmus || !config.natmus.api) {
  throw new Error('You need to specify a natmus API configuration');
}

const Agent = require('agentkeepalive');
const request = require('request').defaults({
  agent: new Agent({
    maxSockets: config.natmus.api.maxSockets || 10
  })
});

const BASE_URL = config.natmus.api.baseURL;
const SEARCH_SIMPLE_URL = BASE_URL + '/search/public/simple';
const SEARCH_RAW_URL = BASE_URL + '/search/public/raw';
const CUMULUS_POST_UPDATE = BASE_URL + '/service/cumulus/postUpdate';

// Used when polling the index for updates
const UPDATED_POLL_TIMEOUT = 10000;
const UPDATED_POLL_FREQUENCY = 1000;
const modifiedBeforeSaving = {};
const DEFAULT_TRANSFORMATIONS = require('./metadata-transforms');

function proxy(options) {
  console.log(
    'Requesting natmus API',
    options.url,
    JSON.stringify(options.body)
  );
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if(error) {
        reject(error);
      } else if(response.statusCode >= 200 && response.statusCode < 300) {
        if(body && body.status && (body.status < 200 || body.status >= 300)) {
          let bodyString = JSON.stringify(body);
          reject(new Error('Got a !200 response from the API: ' + bodyString));
        } else {
          resolve(body);
        }
      } else {
        let bodyString = JSON.stringify(body);
        reject(new Error('Got a !200 response from the API: ' + bodyString));
      }
    });
  });
}

let natmus = {
  search: (options) => {
    if(options.index) {
      console.warn('Calling the document service with index is not supported');
    }
    if(!options.body) {
      throw new Error('Missing the body parameter');
    }

    return proxy({
      url: SEARCH_RAW_URL,
      method: 'POST',
      json: true,
      body: options.body
    }).then(natmus.transformSearchMetadata);
  },
  count: (options) => {
    if(options.index) {
      console.warn('Calling the document service with index is not supported');
    }
    let body = {
      size: 0
    };
    if (options.body && options.body.query) {
      body.query = options.body.query;
    }
    return proxy({
      url: SEARCH_RAW_URL,
      method: 'POST',
      json: true,
      body
    }).then((response) => {
      response.count = response.hits.total;
      return response;
    });
  },
  getSource: (options) => {
    if(options.index) {
      console.warn('Calling the document service with index is not supported');
    }
    let type = options.type;
    let collectionAndId = options.id.split('-');
    assert.equal(collectionAndId.length, 2, 'Expected {collection}-{id}');
    let collection = collectionAndId[0];
    // Apparently the collection needs to be lowercase to match
    collection = collection.toLowerCase();
    let id = collectionAndId[1];

    return proxy({
      url: SEARCH_RAW_URL,
      method: 'POST',
      json: true,
      body: {
        size: 1,
        query: {
          bool: {
            must: [
              {term: {id}},
              {term: {collection}},
              {term: {type}},
            ]
          }
        }
      }
    }).then((response) => {
      if(response.hits.total === 0) {
        let err = new Error('Expected at least one hit, got none');
        err.status = 404;
        throw err;
      } else if(response.hits.total > 1) {
        let err = new Error('Expected 1 hit, got ' + response.hits.total);
        // console.warn(err.message);
        throw err;
      }
      return response.hits.hits[0]._source;
    }).then(natmus.transformMetadata);
  },
  mget: (options) => {
    if(!options.type) {
      throw new Error('Expected a "type"');
    }
    if(!options.body || !options.body.ids) {
      throw new Error('Expected a "body" object with "ids"');
    }
    const type = options.type;
    const queries = options.body.ids.map(id => {
      assert.equal(typeof(id), 'string', 'Expected all ids to be strings');
      const collectionAndId = id.split('-');
      assert.equal(collectionAndId.length, 2, 'Expected {collection}-{id}');

      return {
        bool: {
          must: [
            {term: {collection: collectionAndId[0].toLowerCase()}},
            {term: {id: collectionAndId[1]}},
            {term: {type}},
          ]
        }
      };
    });

    return proxy({
      url: SEARCH_RAW_URL,
      method: 'POST',
      json: true,
      body: {
        size: queries.length,
        query: {
          bool: {
            should: queries
          }
        }
      }
    }).then(natmus.transformSearchMetadata).then((response) => {
      return {
        docs: response.hits.hits.map(hit => {
          hit.found = true;
          return hit;
        })
      };
    });
  },
  transformSearchMetadata: (response, transformations = DEFAULT_TRANSFORMATIONS) => {
    // Transform the document metadata of every hit in a response from the API
    const transformationPromises = response.hits.hits.map(hit => {
      // Mutating the hit object
      return natmus.transformMetadata(hit._source).then(transfomedSource => {
        hit._source = transfomedSource;
        return hit;
      });
    });
    // When all transformations resolve, return the response transformed.
    return Q.all(transformationPromises).then(() => {
      return response;
    });
  },
  transformMetadata: (metadata, transformations = DEFAULT_TRANSFORMATIONS) => {
    // Apply a series of transformations on a metadata document. The transforms
    // are defined via modules in ./metadata-transforms.
    return transformations.reduce(function(metadata, transformation) {
      return Q.when(metadata).then(function(metadata) {
        return transformation(metadata);
      });
    }, new Q(metadata));
  },
  expectChanges: (type, collectionAndId) => {
    const key = type + '/' + collectionAndId;
    return natmus.getSource({
      type: type,
      id: collectionAndId
    }).then(currentMetadata => {
      modifiedBeforeSaving[key] = currentMetadata.meta.modified;
      return currentMetadata;
    });
  },
  hasChanged: (type, collectionAndId) => {
    console.log('Checking for the index for an update ..', collectionAndId);
    const key = type + '/' + collectionAndId;
    const modifiedLast = modifiedBeforeSaving[key];
    if(modifiedLast) {
      return natmus.getSource({
        type: 'asset',
        id: collectionAndId
      }).then(currentMetadata => {
        return {
          changed: modifiedLast !== currentMetadata.meta.modified,
          metadata: currentMetadata
        };
      });
    } else {
      throw new Error('Call expectChanges before hasChanged');
    }
  },
  pollForChange: (type, collectionAndId) => {
    const key = type + '/' + collectionAndId;
    // Start polling the index for changes, based on the meta.modified field
    const startedPolling = new Date();
    let interval;

    return new Promise((resolve, reject) => {
      function check() {
        const now = new Date();
        if (now.getTime() - startedPolling.getTime() > UPDATED_POLL_TIMEOUT) {
          resolve({
            status: 'timeout'
          });
        } else {
          return natmus.hasChanged(type, collectionAndId)
          .then(({changed, metadata}) => {
            if(changed) {
              // Delete the value from the object that we are waiting for
              delete modifiedBeforeSaving[key];
              // Resolve the promise with success
              resolve({
                status: 'success',
                metadata
              });
            }
          });
        }
      }
      // Set the interval to check with the desired frequency
      interval = setInterval(check, UPDATED_POLL_FREQUENCY);
    }).then((result) => {
      // Clear the interval
      clearInterval(interval);
      // Return the result
      return result;
    }, (err) => {
      // Clear the interval
      clearInterval(interval);
      // Rethrow the error
      throw err;
    });
  },
  cumulus: {
    postUpdate: options => {
      assert.ok(options.id, 'Expected an id');

      const query = {};
      if(options.priority) {
        query.priority = options.priority;
      }

      const qs = Object.keys(query).length > 0 ?
                 '?' + querystring.stringify(query) :
                 '';

      return proxy({
        url: CUMULUS_POST_UPDATE + qs,
        method: 'POST',
        json: true,
        body: {
          id: options.id,
          action: options.action || 'Update',
          apiKey: options.apiKey || ''
        }
      });
    },
    updateIndex: (metadata) => {
      const id = metadata.collection + '-' + metadata.id;
      return natmus.cumulus.postUpdate({
        id,
        priority: 'high'
      }).then(() => {
        return natmus.pollForChange('asset', id)
        .then(({status, metadata}) => {
          if(status === 'success') {
            return metadata;
          } else {
            throw new Error('Ændringen blev gemt, men er endnu ikke opdateret');
          }
        });
      });
    }
  }
};

module.exports = natmus;
