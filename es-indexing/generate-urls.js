
module.exports = (metadata) => {
  var collectionAndId = metadata.collection + '/' + metadata.id;
  var prefix = 'http://samlinger.natmus.dk/' + collectionAndId;
  metadata.urls = {
    thumbnail: prefix + '/thumbnail',
    downloadSmall: prefix + '/download/800/' + metadata.filename,
    downloadMedium: prefix + '/download/1200/' + metadata.filename,
    downloadLarge: prefix + '/download/2000/' + metadata.filename,
    downloadOriginalJpeg: prefix + '/download/original/' + metadata.filename,
    downloadOriginal: prefix + '/download/' + metadata.filename
  };
  return metadata;
};
