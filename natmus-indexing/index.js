'use strict';
/**
 * A module that indexes from one elastic-search index to another and performs
 * various transformations along the way
 */

const Q = require('q');
const elasticsearch = require('elasticsearch');
const Agent = require('agentkeepalive');
const request = require('request');
const querystring = require('querystring');
const config = require('../config');

var es = new elasticsearch.Client({
  host: config.es.host,
  createNodeAgent(connection, config) {
    return new Agent(connection.makeAgentConfig(config));
  }
});

const TRANSFORMATIONS = [
  require('./clean-id'),
  require('./derive-collection-name'),
  require('./derive-timestamps'),
  require('./remap')
  // require('./field-renaming'),
  // require('./generate-urls'),
  // require('./remove-null-values')
];

const BASE_URL = 'http://testapi.natmus.dk/';
const SEARCH_URL = BASE_URL + 'search/public/simple';
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
      let collection = metadata.collection;
      if(!collection) {
        throw new Error('Got document without a collection');
      }
      let id = metadata.id;
      return {
        _id: collection + '-' + id,
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

function ensureIndex(type, index) {
  return es.indices.exists({
    index: index
  }).then(function(exists) {
    if (exists) {
      console.log('Index was already created');
      return true;
    } else {
      let mappings = {};
      mappings[type] = {
        properties: config.types[type].mapping
      };
      return es.indices.create({
        index: index,
        body: {
          'index': {
            'max_result_window': 100000 // So sitemaps can access all assets
          },
          'mappings': mappings
        }
      }).then(function() {
        console.log('Index created.');
        return true;
      }, console.error);
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

function indexSingle(type, collection, id) {
  const index = config.types[type].index;
  ensureIndex(type, index).then(() => {
    var query = [
      'type:' + type,
      'collection:' + collection,
      'id:' + id
    ].join(' AND ');
    return run(query, index);
  }, console.error);
}

module.exports.indexSingle = indexSingle;

function indexAll(type) {
  const index = config.types[type].index;
  ensureIndex(type, index).then(() => {
    var query = 'type:' + type;
    if(type === 'object') {
      // Let's get some objects with assets
      // TODO: Remove this later
      query += ' AND _exists_:relatedAssets';
    }
    return run(query, index);
  }, console.error);
}

module.exports.indexAll = indexAll;

function deleteIndex(type) {
  const index = config.types[type].index;
  return es.indices.delete({
    index: index
  }).then(function() {
    console.log('Index "' + index + '" cleared');
  }, console.error);
}

module.exports.deleteIndex = deleteIndex;
