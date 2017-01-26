'use strict';

const co = require('collections-online');
const index = require('./index');

// This allows loading of environment variables from a .env file
require('dotenv').config({
  silent: true,
  path: '..'
});
const config = require('../config');
co.config(config);

if(process.argv.length <= 2) {
  console.error('Give a second argument: asset, object');
} else if(process.argv.length <= 3) {
  console.error('Give a third argument: clear, all');
} else {
  let action = process.argv[2];
  let type = process.argv[3];
  if(!(type in config.types)) {
    throw new Error('No configuration for type: ' + type);
  }
  if(action === 'all') {
    return index.indexAll(type);
  } else if(action === 'single') {
    if(process.argv.length <= 5) {
      console.error('Give a fourth and fifth arguments: {collection} {id}');
    } else {
      let collection = process.argv[4];
      let id = process.argv[5];
      return index.indexSingle(type, collection, id);
    }
  } else if(action === 'clear') {
    return index.deleteIndex(type);
  } else {
    console.error('Unexpected action: ' + action);
  }
}
