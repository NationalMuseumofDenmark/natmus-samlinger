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
  if(metadata.meta && metadata.meta.rotation === 1) {
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

helpers.getDocumentURL = (metadata) => {
  let path = [
    metadata.collection,
    metadata.type,
    metadata.id
  ];
  return '/' + path.join('/');
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

helpers.getDownloadOptions = (metadata) => {
  let result = [];
  /*
  a.btn.btn-primary(href=sources.imageSet.download800.src)
  | Lille (#{sources.imageSet.download800.size} jpg)
  a.btn.btn-primary(href=sources.imageSet.download1200.src)
  | Mellem (#{sources.imageSet.download1200.size} jpg)
  a.btn.btn-primary(href=sources.imageSet.download2000.src)
  | Stor (#{sources.imageSet.download2000.size} jpg)
  a.btn.btn-primary(href=sources.imageSet.downloadOriginal.src)
  | Original (#{metadata.width_px} x #{metadata.height_px} jpg)
  if(file_format === 'TIFF Image')
  a.btn.btn-primary(href=sources.download)
  | Original (#{metadata.width_px} x #{metadata.height_px} tif)
  if(player === 'image-single-animated')
  a.btn.btn-primary(href=sources.download)
  | Original (#{metadata.width_px} x #{metadata.height_px} gif)

  sources.imageSet = {
    400: {src: url + '/image/400', size: sizes[400]},
    800: {src: url + '/image/800', size: sizes[800]},
    1200: {src: url + '/image/1200', size: sizes[1200]},
    2000: {src: url + '/image/2000', size: sizes[2000]},
    original: {src: url + '/image/original', size: sizes['original']},
    // Downloads
    download400: {
      src: url + '/download/400/' + encodedTitle + '.jpg',
      size: sizes[400]},
    download800: {
      src: url + '/download/800/' + encodedTitle + '.jpg',
      size: sizes[800]},
    download1200: {
      src: url + '/download/1200/' + encodedTitle + '.jpg',
      size: sizes[1200]},
    download2000: {
      src: url + '/download/2000/' + encodedTitle + '.jpg',
      size: sizes[2000]},
    downloadOriginal: {
      src: url + '/download/original/' + encodedTitle + '.jpg',
      size: sizes['original']}
  };

  */
  return result;
};

helpers.magic360Options = function(relatedAssets) {
  let relevantAssets = relatedAssets.filter((asset) => {
    return asset.relation === 'child';
  });
  relevantAssets.sort((assetA, assetB) => {
    let nameA = assetA.file.name || '';
    let nameB = assetB.file.name || '';
    return nameA.localeCompare(nameB);
  });
  let relevantAssetUrls = relevantAssets.map((asset) => {
    return helpers.getThumbnailURL(asset, 1280);
  });
  let options = {
    'magnifier-shape': 'circle',
    'magnifier-width': '100%',
    'columns': relevantAssetUrls.length,
    'images': relevantAssetUrls.join(' ')
  };
  let result = '';
  for (var o in options) {
    result += o + ': ' + options[o] + '; ';
  }
  return result;
};

helpers.translate = key => {
  if(config.translations[key]) {
    return config.translations[key];
  } else {
    return key;
  }
};

module.exports = helpers;
