/* global config */
const config = require('collections-online/lib/config');
let helpers = require('collections-online/shared/helpers');

helpers.documentTitle = (metadata, fallback) => {
  let title;
  let type;

  if (metadata.type === 'asset') {
    title = metadata.text['da-DK'].title;
    const player = helpers.determinePlayer(metadata);
    type = config.translations.players[player] || 'Medie';
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

helpers.documentLicense = (metadata) => {
  return metadata.rights && metadata.rights.license;
};

helpers.documentModified = (metadata) => {
  return metadata.meta.modified;
  // return metadata.modification_time.timestamp;
};

helpers.mediaFileType = (metadata) => {
  if(metadata.file && metadata.file.mediaType) {
    let mediaType = metadata.file.mediaType;
    return config.translations.players[mediaType] || 'Medie';
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


helpers.generateSitemapElements = (req, metadata) => {
  const title = helpers.documentTitle(metadata);
  const description = helpers.documentDescription(metadata);
  const relativeThumbnailUrl = helpers.getThumbnailURL(metadata);
  const thumbnailUrl = helpers.getAbsoluteURL(req, relativeThumbnailUrl);
  const elements = [];
  if(metadata.type === 'asset') {
    const player = helpers.determinePlayer(metadata);
    const license = helpers.licenseMapped(metadata);
    const licenseUrl = license ? license.url : null;
    // If the player suggests the asset is an image
    if(['image', 'image-downloaded', 'rotation'].indexOf(player) > -1) {
      // See https://www.google.com/schemas/sitemap-image/1.1/
      elements.push({
        type: 'image',
        location: thumbnailUrl,
        title,
        description,
        licenseUrl
      });
    } else if(player === 'video') {
      // See https://www.google.com/schemas/sitemap-video/1.1/
      // TODO: Consider including 'rating', 'publication_date', 'tag',
      // 'category', 'gallery_loc'
      elements.push({
        type: 'video',
        thumbnailLocation: thumbnailUrl,
        title,
        description,
        contentLocation: helpers.getDirectDownloadURL(metadata),
        licenseUrl
      });
    } else if(player === 'audio') {
      // Currently not supported by an extension to the sitemaps.org standard
    }
  }
  return elements;
};

function getFileDimensionsString(metadata, size) {
  let width = metadata.file.dimensions.width;
  let height = metadata.file.dimensions.height;
  if(typeof(size) === 'number') {
    let ratio = width / height;
    if(ratio > 1) {
      width = size;
      height = size / ratio;
    } else {
      width = size * ratio;
      height = size;
    }
  }
  return Math.round(width) + ' × ' + Math.round(height);
}

function generateSizeDownloadOption(optionKey, option) {
  return {
    label: metadata => {
      let dimensions = getFileDimensionsString(metadata, option.size);
      return option.labelPrefix + ' (' + dimensions + ') JPEG';
    },
    filter: (metadata, derived) => {
      if(derived.player === 'image') {
        if(typeof(size) === 'number') {
          return derived.maxSize >= option.size;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    url: metadata => helpers.getDownloadURL(metadata, optionKey),
  };
}

if(config.downloadOptions) {
  // Loop though the download options defined in the configuration and make them
  // available as an iteratable array of 3-method objects
  const AVAILABLE_DOWNLOAD_OPTIONS = Object.keys(config.downloadOptions)
  .map(optionKey => {
    const option = config.downloadOptions[optionKey];

    if(option.size) {
      return generateSizeDownloadOption(optionKey, option);
    } else if(optionKey === 'original-jpeg') {
      return {
        label: metadata => {
          let label = option.labelPrefix;
          return label + ' (' + getFileDimensionsString(metadata) + ') JPEG';
        },
        filter: metadata => {
          return metadata.file.mediaType !== 'image/jpeg';
        },
        url: metadata => helpers.getDownloadURL(metadata, optionKey),
      };
    } else if(optionKey === 'original') {
      return {
        label: metadata => {
          const mediaType = metadata.file.mediaType;
          const type = config.translations.mediaFileTypes[mediaType];
          const label = option.labelPrefix;
          return label + ' (' + getFileDimensionsString(metadata) + ') ' + type;
        },
        filter: metadata => {
          return true; // Let's always allow download of the original
        },
        url: metadata => helpers.getDownloadURL(metadata),
      };
    } else {
      throw new Error('Expected "orignal", "original-jpeg" or a size field');
    }
  });

  helpers.getDownloadOptions = (metadata) => {
    const hasDimensions = metadata.file && metadata.file.dimensions;
    let maxSize = hasDimensions && Math.max(metadata.file.dimensions.width,
                                            metadata.file.dimensions.height);
    let derived = {
      maxSize,
      player: helpers.determinePlayer(metadata)
    };

    return AVAILABLE_DOWNLOAD_OPTIONS.filter(option => {
      return option.filter(metadata, derived);
    }).map(option => {
      return {
        label: option.label(metadata, derived),
        url: option.url(metadata, derived)
      };
    });
  };
}

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

helpers.isWatermarkRequired = (metadata) => {
  return false;
  /*
  // Looping through the licenses to find the on
  const WATERMARKED_LICENSE_IDS = config.licenseMapping
  .map((license, licenseId) => {
    return {
      id: licenseId,
      watermark: license && license.watermark
    };
  })
  .filter(license => license.watermark)
  .map(license => license.id);

  // If no license is known or the configuration states it
  let requiredByLicense = !metadata.license || WATERMARKED_LICENSE_IDS.indexOf(metadata.license.id) > -1;
  // We should only apply the watermark when the size is large
  let isLarge = size > THUMBNAIL_SIZE;
  */
};

helpers.filesizeMB = (filesize) => {
  if (filesize) {
    var mb = filesize / 1024 / 1024;
    // Formatted
    mb = helpers.decimals(mb, 1);
    return mb + ' MB';
  } else {
    return undefined;
  }
};

helpers.creators = (creators) => {
  if (creators) {
    let creatorsList = [];
    creators.every(obj => creatorsList.push(obj.name));
    return creatorsList.join(', ');
  }
};

helpers.isDownloadable = (metadata) => {
  return !metadata.rights || metadata.rights.license !== 'All Rights Reserved';
};

// TODO: Consider moving this to collections-online?
helpers.collectionLinked = (collection, collectionName) => {
  let url = `/${collection}`;
  helpers.link(url, collectionName);
};

module.exports = helpers;
