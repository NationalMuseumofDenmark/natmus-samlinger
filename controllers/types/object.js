'use strict';

const documentController = require('collections-online/lib/controllers/document');
const config = require('collections-online/lib/config');
const layouts = require('collections-online/lib/layouts');
const helpers = require('collections-online/shared/helpers');

const objectSection = layouts.section('object');

const Q = require('q');
const request = require('request');
const querystring = require('querystring');

function getObject(req) {
  let deferred = Q.defer();
  let id = req.params.id;
  let collection = req.params.collection;

  let query = {
    sourceId: id,
    collection
  };
  let queryString = Object.keys(query).map((key) => {
    return key + ':' + query[key];
  }).join(' AND ');

  let qs = querystring.stringify({
    query: queryString,
    size: 1
  });

  let url = 'http://testapi.natmus.dk/search/public/simple?' + qs;
  request({
    url,
    json: true
  }, (err, res, body) => {
    if(err) {
      deferred.reject(err);
    } else {
      let results = body.results;
      if(body.numberOfResultsTotal > 1) {
        let err = new Error('The API returned more than one record');
        deferred.reject(err);
      } else if(body.numberOfResultsTotal === 0) {
        let err = new Error('The API returned no records');
        err.status = 404;
        deferred.reject(err);
      } else {
        deferred.resolve(results[0].data || {});
      }
    }
  });
  return deferred.promise;
}

/**
 * Renders an asset's landing page
 */
exports.index = function(req, res, next) {
  return documentController.get(req, 'object').then((metadata) => {
    return {
      'metadata': metadata,
      'objectSection': objectSection(),
      'req': req
    };
  })
  .then(function(renderParameters) {
    if (renderParameters) {
      res.render('object.pug', renderParameters);
    }
  })
  .then(null, function(error) {
    if (error.message === 'Not Found') {
      error.status = 404;
    }
    next(error);
  });
};

exports.thumbnail = function(req, res, next) {
  const size = req.params.size || null;
  return documentController.get(req, 'object').then(metadata => {
    if(metadata.related &&
       metadata.related.assets &&
       metadata.related.assets.length > 0) {
      const primaryAsset = metadata.related.assets[0];
      const primaryAssetId = helpers.cleanDocumentId(primaryAsset.id,
                                                     primaryAsset.collection,
                                                     true);
      const thumbnailUrl = helpers.getThumbnailURL({
        type: 'asset',
        id: primaryAssetId.id,
        collection: primaryAssetId.collection
      }, size);

      res.redirect(thumbnailUrl);
    } else {
      throw new Error('Not Found');
    }
  })
  .then(null, function(error) {
    if (error.message === 'Not Found') {
      error.status = 404;
    }
    next(error);
  });
};
