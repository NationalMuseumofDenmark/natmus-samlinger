// Fixing varying values of the asset and object types
// These are sometimes "Still" or "STILL"
module.exports = function(metadata) {
  if (metadata.related && metadata.related.assets) {
    metadata.related.assets.forEach(asset => {
      if(typeof(asset.type) === 'string') {
        asset.type = asset.type.toLowerCase();
      }
    });
  }
  return metadata;
};
