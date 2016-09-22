'use strict';

var co = require('collections-online');

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
