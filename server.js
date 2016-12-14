'use strict';
const express = require('express');
const co = require('collections-online');
co.config(__dirname);

// Loading the configuration
var config = require('./config');

// Creating an express app
var app = express();

// Initialize the collections online application
// Natmus specific plugins
const plugins = require('collections-online/plugins');

const natmusModule = {
  initialize: () => {
    // Nothing really
  },
  registerPlugins: () => {
    // plugins.register('geo-tag-controller', require('./controllers/geo-tag'));
    plugins.register('motif-tag-controller',
                     require('./controllers/motif-tag'));
    plugins.register('document-service',
                     require('./services/natmus-api'));
  }
};

co.initialize(app, [
  natmusModule,
  require('collections-online-cumulus')
]).then(() => {
  var mainRouter = require('./routers/main');
  app.use('/', mainRouter);
  co.registerRoutes(app);
  co.registerErrors(app);
}).then(null, console.error);
