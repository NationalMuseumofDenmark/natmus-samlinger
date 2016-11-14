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
  require('./clean-id'),
  require('./derive-collection-name'),
  require('./remap')
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

if(process.argv.length <= 2) {
  console.error('Give a second argument: asset, object');
} else if(process.argv.length <= 3) {
  console.error('Give a third argument: clear, all');
} else {
  let action = process.argv[2];
  let type = process.argv[3];
  if(action === 'all') {
    let index;
    if(process.argv.length > 4) {
      index = process.argv[3];
    } else {
      index = 'new_' + type + 's';
      console.log('Assuming index: ' + index);
    }
    ensureIndex(type, index).then(() => {
      var query = 'type:' + type;
      if(type === 'object') {
        // Let's get some objects with assets
        // TODO: Remove this later
        query += ' AND _exists_:relatedAssets';
      }
      run(query, index);
    }, console.error);
  } else if(action === 'clear') {
    if(process.argv.length > 4) {
      let index = process.argv[4];
      return es.indices.delete({
        index: index
      }).then(function() {
        console.log('Index "' + index + '" cleared');
      }, console.error);
    } else {
      console.error('Give a forth argument: {index}');
    }
  } else {
    console.error('Unexpected action: ' + action);
  }
}
