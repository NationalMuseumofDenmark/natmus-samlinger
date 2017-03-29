const _ = require('lodash');
const moment = require('moment');

const config = require('collections-online/lib/config');
const helpers = require('collections-online/shared/helpers');
const Q = require('q');

helpers.documentTitle = (metadata, fallback) => {
  let title;
  let type;

  if (metadata.type === 'asset') {
    title = metadata.text['da-DK'].title;
    const players = helpers.determinePlayers(metadata);
    const mediaType = players.find(player => player.type);
    type = (mediaType && config.translations.players[mediaType]) || 'Medie';
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
    // Get values from a lot of fields, filter out any empty string and undefied
    description = helpers.getAnyFlat(metadata, [
      'accessionEvents.dimensions.overallDescription',
      'creationEvents.dimensions.overallDescription',
      'foundEvents.dimensions.overallDescription',
      'usageEvents.dimensions.overallDescription',
      'accessionEvents.eventNote',
      'accessionEvents.protocolText',
      'objectDimensionOverallDescription'
    ]).filter(value => value).join('\n\n');
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
  if(metadata.type === 'asset') {
    return metadata.meta.modified;
  } else if(metadata.type === 'object') {
    return metadata.createdDate;
  } else {
    throw new Error('Not implemented');
  }
  // return metadata.modification_time.timestamp;
};

helpers.mediaFileType = (metadata) => {
  if(metadata.file && metadata.file.mediaType) {
    let mediaType = metadata.file.mediaType;
    return config.translations.players[mediaType] || 'Medie';
  }
};

helpers.getNummericId = metadata => {
  if(typeof(metadata.id) === 'string') {
    const collectionAndId = metadata.id.split('-');
    const stringId = collectionAndId[collectionAndId.length-1];
    return parseInt(stringId, 10);
  } else if(typeof(metadata.id) === 'number') {
    return metadata.id;
  } else {
    throw new Error('Got a metadata with an unexpected id');
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

helpers.determineMediaTypes = metadata => {
  const players = helpers.determinePlayers(metadata);
  return players.map(player => player.type);
};

helpers.determinePlayers = metadata => {
  const players = [];
  // Get at list of related assets and filter out any without an id
  const relatedAssets = (
    (metadata.related && metadata.related.assets) || []
  ).filter(asset => asset.id);

  if(metadata.type === 'asset') {
    if(metadata.meta && metadata.meta.rotation === 1) {
      players.push({
        type: 'rotation',
        thumbnail: helpers.getThumbnailURL(metadata, 1280),
        images: metadata.related.assets.filter((asset) => {
          return asset.relation === 'child';
        })
      });
    } else if(metadata.file && metadata.file.mediaType) {
      // Iterate the players and try to determine the player based on media type
      const player = Object.keys(playerFromFileMediaType)
      .reduce((result, type) => {
        let mediaTypes = playerFromFileMediaType[type];
        if(!result && mediaTypes.indexOf(metadata.file.mediaType) > -1) {
          return {
            type
          };
        }
        return result;
      }, null);
      // Add it to the result
      if(player) {
        players.push(player);
      }
    }
  } else if(metadata.type === 'object') {
    const rotationAssets = relatedAssets.filter(asset => {
      return asset.assetType === 'Rotation';
    });
    const stillAssets = relatedAssets.filter(asset => {
      return asset.assetType === 'Still';
    });

    if(rotationAssets.length > 0) {
      // If an object has a related asset of type rotation, return that as the
      // primary player.
      const images = rotationAssets.map(asset => {
        return {
          type: 'asset',
          id: helpers.getNummericId(asset),
          collection: metadata.collection
        };
      });
      // Add this to the players
      players.push({
        type: 'rotation',
        thumbnail: helpers.getThumbnailURL(metadata, 1280),
        images
      });
    }
    // Still images
    if(stillAssets.length > 0) {
      const images = stillAssets.map(asset => {
        const stillMetadata = {
          type: 'asset',
          id: helpers.getNummericId(asset),
          collection: metadata.collection
        };
        return {
          thumbnail: helpers.getThumbnailURL(stillMetadata, 1280),
          title: asset.fileName
        };
      });
      // Add it to the players
      players.push({
        type: 'multiple-images',
        images
      });
    }
  }
  return players;
};

helpers.flattenValues = (obj) => {
  return _.flatten(_.values(obj));
};

helpers.generateSitemapElements = (req, metadata) => {
  const title = helpers.documentTitle(metadata);
  const description = helpers.documentDescription(metadata);
  const relativeThumbnailUrl = helpers.getThumbnailURL(metadata);
  const thumbnailUrl = helpers.getAbsoluteURL(req, relativeThumbnailUrl);
  const elements = [];
  if(metadata.type === 'asset') {
    const mediaTypes = helpers.determineMediaTypes(metadata);
    const license = helpers.licenseMapped(metadata);
    const licenseUrl = license ? license.url : null;
    mediaTypes.forEach(type => {
      // If the player suggests the asset is an image
      if(['image', 'image-downloaded', 'rotation'].indexOf(type) > -1) {
        // See https://www.google.com/schemas/sitemap-image/1.1/
        elements.push({
          type: 'image',
          location: thumbnailUrl,
          title,
          description,
          licenseUrl
        });
      } else if(type === 'video') {
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
      } else if(type === 'audio') {
        // Currently not supported by an extension to the sitemaps.org standard
      }
    });
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
      if(derived.mediaType === 'image') {
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
      mediaType: helpers.determinePlayers(metadata).find(player => player.type)
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

helpers.magic360Options = function(assets) {
  let relevantAssetUrls = assets.map((asset) => {
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
};

helpers.isDownloadable = (metadata) => {
  return !metadata.rights || metadata.rights.license !== 'All Rights Reserved';
};

helpers.isGeoTagsEditable = (metadata) => {
  const verifiedLocation = (metadata.location && metadata.location.verified) ||
                           {};
  return !verifiedLocation.latitude && !verifiedLocation.longitude;
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

// TODO: Consider moving this to collections-online?
helpers.collectionLinked = (collection, collectionName) => {
  let url = `/${collection}`;
  helpers.link(url, collectionName);
};

const documentIdRegExp = /([A-Z]{0,3})[_-]*(\d+)[_-]*/;

/**
 * Fixes malformed related ids
 */
helpers.cleanDocumentId = (id, fallbackCollection, asObject) => {
  let result = {};

  const match = documentIdRegExp.exec(id);
  if(match) {
    const matchCollection = match[1];
    const matchId = match[2];
    if(matchCollection) {
      result.collection = matchCollection;
    } else if(!matchCollection && fallbackCollection) {
      result.collection = fallbackCollection;
    } else {
      throw new Error('Could not determine the collection.');
    }
    result.id = matchId;
  } else {
    throw new Error('Input did not match the expected pattern.');
  }

  if(asObject) {
    return result;
  } else {
    return result.collection + '-' + result.id;
  }
};

helpers.motifTagging = {
  getTags: metadata => {
    return metadata.tags && metadata.tags.crowd;
  },
  getVisionTags: metadata => {
    return metadata.tags && metadata.tags.automated;
  },
  addTag: (metadata, tag) => {
    if(!metadata.tags) {
      metadata.tags = {};
    }
    if(!metadata.tags.crowd) {
      metadata.tags.crowd = [];
    }
    // Add it to the tags if not already there
    if(metadata.tags.crowd.indexOf(tag) === -1) {
      metadata.tags.crowd.push(tag);
    }
    // Remove it from the vision tags if there
    helpers.motifTagging.removeVisionTag(metadata, tag);
  },
  removeTag: (metadata, tag) => {
    // Is it there?
    const tagIndex = metadata.tags.crowd.indexOf(tag);
    if(tagIndex > -1) {
      // Remove it
      metadata.tags.crowd.splice(tagIndex, 1);
    }
  },
  removeVisionTag: (metadata, tag) => {
    // Is it there?
    const tagIndex = metadata.tags.automated.indexOf(tag);
    if(tagIndex > -1) {
      // Remove it
      metadata.tags.automated.splice(tagIndex, 1);
    }
  }
};

helpers.geoTagging = {
  getLocation: (metadata) => {
    return metadata.location && metadata.location.crowd;
  },
  enabled: (metadata) => {
    const verifiedLocation = metadata.location && metadata.location.verified;
    return !verifiedLocation ||
           !verifiedLocation.latitude ||
           !verifiedLocation.longitude;
  }
};

helpers.dateInterval = (fromString, toString) => {
  let dates = [];
  if(fromString) {
    let from = moment(fromString);
    dates.push(from.format('L'));
  }
  if(toString) {
    let to = moment(toString);
    dates.push(to.format('L'));
  }
  return dates.join(' - ');
};

helpers.formatEvent = (e) => {
  let result = e.eventTypeSubDescription;
  if(e.dateFrom || e.dateTo) {
    result += ' ' + helpers.dateInterval(e.dateFrom, e.dateTo);
  }
  if(e.place) {
    result += ' (' + e.place + ')';
  }
  return result;
};

// Apply a series of transformations on a metadata document. The transforms are
// defined via modules in ./metadata-transforms.
helpers.transformMetadata = (metadata, transformations = require('./metadata-transforms')) => {
  return transformations.reduce(function(metadata, transformation) {
    return Q.when(metadata).then(function(metadata) {
      return transformation(metadata);
    });
  }, new Q(metadata));
};

module.exports = helpers;
