'use strict';
const plugins = require('collections-online/plugins');

module.exports.register = () => {
  plugins.register(require('./natmus-api'));
  plugins.register(require('./motif-tag'));
  plugins.register(require('./geo-tag'));
  require('collections-online-cumulus').registerPlugins();
  require('collections-online').registerPlugins();
};
