'use strict';

const assert = require('assert');
const config = require('../config');
const Q = require('q');

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

// Used when polling the index for updates
const UPDATED_POLL_TIMEOUT = 10000;
const UPDATED_POLL_FREQUENCY = 1000;
const modifiedBeforeSaving = {};
const DEFAULT_TRANSFORMATIONS = require('./metadata-transforms');

function proxy(options) {
  console.log('Requesting natmus API with', JSON.stringify(options.body));
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if(error) {
        reject(error);
      } else if(response.statusCode === 200) {
        // TODO: Suggest that the natmus API returns correct error-codes
        if(body.status && body.status !== 200) {
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
    });
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
    });
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
    }).then((response) => {
      return {
        docs: response.hits.hits.map(hit => {
          hit.found = true;
          return hit;
        })
      };
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
        return modifiedLast !== currentMetadata.meta.modified;
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
            'status': 'timeout'
          });
        } else {
          return natmus.hasChanged(type, collectionAndId).then((changed) => {
            if(changed) {
              // Delete the value from the object that we are waiting for
              delete modifiedBeforeSaving[key];
              // Resolve the promise with success
              resolve({
                'status': 'success'
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
  }
};

module.exports = natmus;
