'use strict';
/**
 * A module that indexes from one elastic-search index to another and performs
 * various transformations along the way
 */

const co = require('collections-online');
const Q = require('q');
const elasticsearch = require('elasticsearch');
const Agent = require('agentkeepalive');
const request = require('request');
const querystring = require('querystring');

// This allows loading of environment variables from a .env file
require('dotenv').config({
  silent: true,
  path: '..'
});
const config = require('../config');
co.config(config);

var es = new elasticsearch.Client({
  host: config.es.host,
  createNodeAgent(connection, config) {
    return new Agent(connection.makeAgentConfig(config));
  }
});

const TRANSFORMATIONS = [
  require('./print-metadata')
  // require('./camel-casing-field-names'),
  // require('./field-renaming'),
  // require('./generate-urls'),
  // require('./remove-null-values')
];

const BASE_URL = 'http://testapi.natmus.dk/';
const SEARCH_URL = BASE_URL + 'search/public/elasticSearchString';
const natmusAgent = new Agent();

function search(query, size, offset) {
  let deferred = Q.defer();
  let qs = querystring.stringify({
    query, size, offset
  });
  let url = SEARCH_URL + '?' + qs;
  request({
    url,
    agent: natmusAgent,
    json: true
  }, (err, res, body) => {
    if(err) {
      deferred.reject(err);
    } else {
      deferred.resolve(body);
    }
  });
  return deferred.promise;
}

function transformAndInsert(hits, index) {
  // collect the title from each response
  return Q.all(hits.map(function (hit) {
    return TRANSFORMATIONS.reduce(Q.when, hit.data).then((metadata) => {
      let type = (hit.meta.type || '').toLowerCase();
      let collection = (metadata.collection || '').toLowerCase();
      let id = [collection, type, metadata.id].join('-');
      return {
        _id: id,
        _type: type,
        _source: metadata
      };
    });
  })).then((hits) => {
    // Save all these items to a different index
    var actions = [];

    hits.forEach((hit) => {
      // Insert
      actions.push({
        index: {
          _index: index,
          _type: hit._type,
          _id: hit._id,
        }
      });
      // Document
      actions.push(hit._source);
    });
    if(actions.length > 0) {
      return es.bulk({
        body: actions
      }).then(() => {
        return hits.length;
      });
    }
  });
}

function run(query, index) {
  console.log('Hello from natmus-indexing');
  const SIZE = 1000;
  let offset = 0;
  function nextPage() {
    search(query, SIZE, offset).then((response) => {
      if(response.numberOfResultsTotal > 0) {
        return transformAndInsert(response.results, index)
        .then(() => {
          let indexed = offset+SIZE;
          let total = response.numberOfResultsTotal;
          console.log('Finished the first ' + indexed + ' of ' + total);
          if(indexed < total) {
            offset = indexed;
            nextPage();
          }
        });
      } else {
        console.error(response);
        throw new Error('API returned an unexpected response.');
      }
    }).then(null, console.error);
  }
  // Go!
  nextPage();
}

run('type:asset', 'new_assets');
run('type:object', 'new_objects');
