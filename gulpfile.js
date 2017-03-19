// ------------------------------------------
// Require - sorted alphabetically after npm name
// ------------------------------------------
require('dotenv').config({
  silent: true
});

// If the NODE_ENV is not set, assume development
if(!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

var gulp = require('gulp');
var sequence = require('run-sequence');

// ------------------------------------------
// Get the gulp content from the main
// ------------------------------------------

require('collections-online/build/gulp')(gulp, __dirname);

// ------------------------------------------
// Combining tasks
// ------------------------------------------

gulp.task('build', function (callback) {
  // put stuff in arrays that you'd want to run in parallel
  sequence(['clean', 'bower'],
           ['css', 'js', 'svg'],
           callback);
});

// ------------------------------------------
// Default task
// ------------------------------------------

gulp.task('default', function (callback) {
  if (process.env.NODE_ENV === 'development') {
    sequence(['build'],
             ['watch'],
             callback);
  } else {
    sequence(['build'],
             callback);
  }
});
