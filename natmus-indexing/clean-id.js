'use strict';

module.exports = (metadata) => {
  metadata.id = parseInt(metadata.id || metadata.sourceId, 10);
  delete metadata.sourceId;
  return metadata;
};
