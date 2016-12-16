/* global config */
const config = require('collections-online/lib/config');
let helpers = require('collections-online/shared/helpers');

helpers.documentTitle = (metadata, fallback) => {
  let title;
  let type;

  if (metadata.type === 'asset') {
    title = metadata.text['da-DK'].title;
    type = helpers.mediaFileType(metadata);
  } else if(metadata.type === 'object') {
    title = metadata.workDescription;
    type = 'Genstand';
  }

  if(!title) {
    if(typeof(fallback) !== 'undefined') {
      title = fallback;
    } else if(type) {
      title = type + ' uden titel';
    } else {
      title = 'Dokument med ukendt type';
    }
  }
  return helpers.capitalizeFirstLetter(title);
};

helpers.documentDescription = (metadata, fallback) => {
  let description;

  if (metadata.type === 'asset') {
    description = metadata.text['da-DK'].description;
  } else if(metadata.type === 'object') {
    let dimensions = metadata.dimensions || [];
    description = dimensions
      .map(dimension => dimension.overallDescription)
      .join(', ');
  }

  if(!description && typeof(fallback) !== 'undefined') {
    description = fallback;
  } else if(!description) {
    description = 'Uden beskrivelse';
  }
  return helpers.capitalizeFirstLetter(description);
};

helpers.mediaFileType = (metadata) => {
  if(metadata.file && metadata.file.mediaType) {
    let mediaType = metadata.file.mediaType;
    return config.translations.mediaFileTypes[mediaType] || 'Medie';
  }
};

const playerFromFileMediaType = {
  'document': [
    'image/portable'
  ],
  'image': [
    'image/bitmap',
    'image/canon',
    'image/grid',
    'image/jpeg',
    'image/nikon',
    'image/photoshop',
    'image/tiff'
  ],
  'image-downloaded': [
    'image/gif'
  ],
  'audio': [
    'image/mp3'
  ],
  'video': [
    'image/mpeg-4',
    'image/mpeg'
  ]
};

helpers.determinePlayer = (metadata) => {
  if(metadata.meta && metadata.meta.rotation) {
    return 'rotation';
  } else if(metadata.file && metadata.file.mediaType) {
    // Iterate the players and try to determine the player based on media type
    let player = Object.keys(playerFromFileMediaType)
    .reduce((result, player) => {
      let mediaTypes = playerFromFileMediaType[player];
      if(!result && mediaTypes.indexOf(metadata.file.mediaType) > -1) {
        return player;
      }
      return result;
    }, undefined);
    return player || 'unknown';
  } else {
    return 'unknown';
  }
};

helpers.getThumbnailURL = (metadata, size) => {
  let path = [
    metadata.collection,
    metadata.type,
    metadata.id,
    'thumbnail'
  ];
  if(size) {
    path.push(size);
  }
  return '/' + path.join('/');
};

helpers.getDownloadURL = (metadata) => {
  return '/' + [
    metadata.collection,
    metadata.type,
    metadata.id,
    'download'
  ].join('/');
};

module.exports = helpers;
