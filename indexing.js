'use strict';

// Configure collections-online
var config = require('./config');
require('collections-online').config(config);

// This registers the cumulus indexing-engine
require('collections-online-cumulus').registerPlugins();
// Start the indexing
require('collections-online/indexing');
