'use strict';

const config = require('collections-online/lib/config');
const querystring = require('querystring');
const searchController = require('collections-online/lib/controllers/search');

module.exports.redirect = function(req, res, next) {
  const catalog = req.params[0];
  // Replace a path param on catalog, with a query param
  req.query.collection = catalog;
  var qs = querystring.stringify(req.query);
  res.redirect('/' + config.search.path + '?' + qs);
};
