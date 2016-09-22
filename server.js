'use strict';
var express = require('express');
var co = require('collections-online');

// Loading the configuration
var config = require('./config');

// Creating an express app
var app = express();
co.config(config);

// Plugins
require('collections-online-cumulus');

co.initialize(app);

require('./routes')(app);
co.registerRoutes(app);

co.registerErrors(app);
