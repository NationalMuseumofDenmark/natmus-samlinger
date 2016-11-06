'use strict';

const es = require('collections-online/lib/services/elasticsearch');
const documentCtrl = require('collections-online/lib/controllers/document');
const config = require('collections-online/lib/config');
const section = require('collections-online/lib/section');
const objectSection = section('object');

/**
 * Renders an asset's landing page
 */
exports.index = function(req, res, next) {
  return documentCtrl.get(req, 'object').then((metadata) => {
    return {
      'metadata': metadata,
      'objectSection': objectSection({}),
      'req': req
    };
  })
  .then(function(renderParameters) {
    if (renderParameters) {
      res.render('object.jade', renderParameters);
    }
  })
  .then(null, function(error) {
    if (error.message === 'Not Found') {
      error.status = 404;
    }
    next(error);
  });
};
