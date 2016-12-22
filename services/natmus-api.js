'use strict';

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

module.exports = {
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
    if (options.query) {
      body.query = options.query;
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
    if(collectionAndId.length != 2) {
      throw new Error('Expected a collection and id seperated by a dash "-"');
    }
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
      if(response.hits.total !== 1) {
        let err = new Error('Expected one result, got ' + response.hits.total);
        if(response.hits.total === 0) {
          err.status = 404;
        }
        throw err;
      } else {
        return response.hits.hits[0]._source;
      }
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
      const collectionAndId = id.split('-');
      if(collectionAndId.length != 2) {
        throw new Error('Expected a collection and id seperated by a dash "-"');
      }

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
  }
};
