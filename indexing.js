'use strict';

var co = require('collections-online');

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});
// Loading the configuration
var state = {};
var config = require('./config');
co.config(config);

// Configure collections-online
var config = require('./config');
require('collections-online').config(config);

// This registers the cumulus indexing-engine
require('collections-online-cumulus').registerPlugins();
// Start the indexing
require('collections-online/indexing').run();
