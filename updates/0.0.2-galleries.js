var Q = require('q');
var keystone = require('collections-online/plugins/keystone').module;

var Gallery = keystone.list('Gallery');
var GalleryItem = keystone.list('Gallery item');

module.exports = function(done) {
  var as = new GalleryItem.model({
    title: 'Antiksamlingen',
    description: '...',
    link: '/?collection=AS'
  }).save();

  var dmr = new GalleryItem.model({
    title: 'Danmarks Middelalder og Renæssance',
    description: '...',
    link: '/?collection=DMR'
  }).save();

  var dnt = new GalleryItem.model({
    title: 'Danmarks Nyere Tid',
    description: '...',
    link: '/?collection=DNT'
  }).save();

  var danmarksOldtid = new GalleryItem.model({
    title: 'Danmarks Oldtid',
    description: '...',
    link: '/?collection=DO'
  }).save();

  Q.all([as, dmr, dnt, danmarksOldtid]).then((items) => {
    // Creating two test galleries
    var gallery1 = new Gallery.model({
      title: 'Samlinger #1',
      description: '...',
      order: 0,
      items: items.map((item) => { return item._id; }),
      state: 'published'
    }).save();

    var gallery2 = new Gallery.model({
      title: 'Samlinger #2',
      description: '...',
      order: 1,
      items: items.reverse().map((item) => { return item._id; }),
      state: 'published'
    }).save();

    return Q.all([gallery1, gallery2]);
  }).then(() => {
    done();
  }, console.error);
};
