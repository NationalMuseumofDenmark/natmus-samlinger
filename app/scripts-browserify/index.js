// Always include collections-online's base
require('collections-online/app/scripts-browserify/base')({
  helpers: require('../../shared/helpers')
});

// Project specific
require('./magic360');
