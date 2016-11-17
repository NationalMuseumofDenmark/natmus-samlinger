const config = require('collections-online/lib/config');
const es = require('collections-online/lib/services/elasticsearch');

const motifTagController =
  require('collections-online-cumulus/controllers/motif-tag');

const indexSingle = require('../natmus-indexing').single;

module.exports.save = motifTagController.save;

module.exports.updateIndex = (metadata) => {
  return indexSingle('asset', metadata.collection, metadata.id);
};
