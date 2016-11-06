'use strict';
var express = require('express');
var co = require('collections-online');

// Loading the configuration
var config = require('./config');

// Creating an express app
var app = express();
co.config(config);

// Initialize the collections online application
co.initialize(app, [
  require('collections-online-cumulus')
]).then(() => {
  var mainRouter = require('./routers/main');
  app.use('/', mainRouter);
  co.registerRoutes(app);
  co.registerErrors(app);
}).then(null, console.error);
