'use strict';

/**
 * The post processing step that steps through all currently indexed assets
 * and deletes every asset that was not indexed during this run of the update to
 * the index.
 */

module.exports = function(state) {
  // TODO: Consider enabling this for state.mode === 'catalog' as well.
  if (state.mode === 'all') {
    console.log('Deleting every asset in the index, except',
                state.indexedAssetIds.length);

    var idsToBeRemoved = [];

    var index = process.env.ES_INDEX || 'assets';

    // first we do a search, and specify a scroll timeout
    return state.es.search({
      index: index,
      // Set to 30 seconds because we are calling right back
      scroll: '30s',
      size: 1000,
      fields: ['id']
    }).then(function getMoreUntilDone(response) {
      // Loop through each of these and collect the assets ID in case it was not
      // indexed in this run of indexing.
      response.hits.hits.forEach(function(hit) {
        if (state.indexedAssetIds.indexOf(hit._id) === -1) {
          idsToBeRemoved.push(hit._id);
        }
      });

      if (response.hits.hits.length > 0) {
        var scrollId = response._scroll_id; // jscs: disable
        // now we can call scroll over and over
        return state.es.scroll({
          scrollId: scrollId,
          scroll: '30s'
        }).then(getMoreUntilDone);
      } else {
        return idsToBeRemoved;
      }
    }).then(function(idsToBeRemoved) {
      console.log('Removing', idsToBeRemoved.length, 'assets from the index.');
      return state.es.deleteByQuery({
        index: index,
        body: {
          query: {
            ids: {
              values: idsToBeRemoved
            }
          }
        }
      });
    }).then(function() {
      return state;
    });
  } else {
    // TODO: Consider implementing the deletion of assets when in catalog mode
    // as well.
    console.log('Removed assets will only be deleted when in all mode.');
    return state;
  }
};
