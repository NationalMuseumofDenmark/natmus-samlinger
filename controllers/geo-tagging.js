const config = require('collections-online/lib/config');
const cumulus = require('collections-online-cumulus/controllers/geo-tagging');
const ds = require('collections-online/lib/services/documents');

const natmusApi = require('../services/natmus-api');

module.exports.save = (metadata) => {
  const id = metadata.collection + '-' + metadata.id;
  // Expect changes - to detect a change
  return natmusApi.expectChanges('asset', id)
  .then((currentMetadata) => {
    return cumulus.save(metadata);
  });
};

module.exports.updateIndex = natmusApi.cumulus.updateIndex;
