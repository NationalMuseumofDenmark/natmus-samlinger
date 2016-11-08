'use strict';

const config = require('../config');
const UNKNOWN_COLLECTION = 'Ukendt samling';

module.exports = (metadata) => {
  metadata.collectionName = config.cip.catalogs[metadata.collection] ||
                            UNKNOWN_COLLECTION;
  return metadata;
};
