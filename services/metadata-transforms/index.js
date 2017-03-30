// Require tranforms we want applied to metadata documents as they come in from
// ES. Each transform should be specific, and ideally removable some time in the
// future as the API offers the original document in the form we need.
module.exports = [
  require('./related-assets-type'),
  require('./sort-related-assets')
];
