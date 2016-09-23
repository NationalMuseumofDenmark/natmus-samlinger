/**
 * A module that indexes from one elastic-search index to another and performs
 * various transformations along the way
 */

var Q = require('q');
var elasticsearch = require('elasticsearch');
var Agent = require('agentkeepalive');

const TRANSFORMATIONS = [
  require('./camel-casing-field-names'),
  require('./field-renaming'),
  require('./generate-urls'),
  require('./remove-null-values')
];

function run(esHost, fromIndex, toIndex) {
  console.log('Hello from es-indexing');

  var es = new elasticsearch.Client({
    host: esHost,
    createNodeAgent(connection, config) {
      return new Agent(connection.makeAgentConfig(config));
    }
  });

  var processedItems = 0;

  // first we do a search, and specify a scroll timeout
  es.search({
    index: fromIndex,
    scroll: '30s',
    search_type: 'scan'
  }, function getMoreUntilDone(error, response) {
    if(error) {
      console.error(error);
    }
    // collect the title from each response
    Q.all(response.hits.hits.map(function (hit) {
      return TRANSFORMATIONS.reduce(Q.when, hit._source).then((_source) => {
        return {
          _id: hit._id,
          _type: hit._type,
          _source: _source
        };
      });
    })).then((hits) => {
      // Save all these items to a different index
      var actions = [];

      hits.forEach((hit) => {
        // Insert
        actions.push({
          index: {
            _index: toIndex,
            _type: hit._type,
            _id: hit._id,

          }
        });
        // Document
        actions.push(hit._source);
      });
      processedItems += hits.length;
      if(actions.length > 0) {
        return es.bulk({
          body: actions
        });
      }
    }).then(() => {
      console.log('processedItems =', processedItems);
      if (processedItems < response.hits.total) {
        // now we can call scroll over and over
        es.scroll({
          scrollId: response._scroll_id,
          scroll: '30s'
        }, getMoreUntilDone);
      } else {
        console.log('All done ...');
      }
    }, console.error);
  });
}

run('http://localhost:9201/', 'assets', 'assets_camel_casing');
