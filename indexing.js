'use strict';

var co = require('collections-online');

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});
// Loading the configuration
var state = {};
var config = require('./config');
co.indexing(state, config).then(function() {
  console.log('\nAll done - good bye!');
  process.exit(0);
}, function(err) {
  console.error('An error occured!');
  console.error(err.stack || err);
  process.exit(1);
});
