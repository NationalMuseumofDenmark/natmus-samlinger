'use strict';

const natmus = require('../services/natmus-api');

module.exports.proxy = (req, res, next) => {
  let index = req.params.index || 'all';
  let action = req.params.action;

  if(index !== 'all') {
    throw new Error('Unsupported index: ' + index);
  }

  if(action !== '_search') {
    throw new Error('Unsupported action: ' + action);
  }

  let body = req.body || {};
  if(req.query.size) {
    body.size = req.query.size;
  }
  if(req.query.from) {
    body.from = req.query.from;
  }

  natmus.search(body).then((response) => {
    res.json(response);
  }, next);
};
