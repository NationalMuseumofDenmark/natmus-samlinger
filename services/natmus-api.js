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
  search: (body) => {
    console.log('Requesting the natmus API: ' + JSON.stringify(body));
    return proxy({
      url: SEARCH_RAW_URL,
      method: 'POST',
      json: true,
      body: body
    }).then((response) => {
      console.log('Search result from natmus:', response);
      return response;
    });
  },
  count: () => {
    return proxy({
      url: SEARCH_RAW_URL,
      method: 'POST',
      json: true,
      body: {
        size: 0
      }
    }).then((response) => {
      response.count = response.hits.total;
      return response;
    });
  }
};
