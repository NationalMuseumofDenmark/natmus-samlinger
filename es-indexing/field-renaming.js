var _ = require('lodash');

const FIELD_MAPPING = {
  catalog: 'collection',
  locationnote: 'locationNote',
  modificationTime: 'modification',
  acceptanceTimeFrom: 'accessionFrom',
  acceptanceTimeTo: 'accessionTo',
  timenote: 'timeNote',
  archivename: 'archiveName',
  categoriesInt: 'categoriesIds',
  archiveno: null
};

module.exports = (metadata) => {
  _.forEach(FIELD_MAPPING, (newField, oldField) => {
    var value = metadata[oldField];
    if(value !== undefined) {
      if(newField != null) {
        metadata[newField] = metadata[oldField];
      }
      delete metadata[oldField];
    }
  });
  return metadata;
};
