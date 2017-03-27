'use strict';

// Asset-value prefixes that in effect decides how assets are sorted.
// We want the following order
// - Rotation assets
// - "labeled" assets (filename ends in a single-char label)
// - Remaining assets.

// Rotation image assets.
const WEIGHT_ROT = '0100';
// Still-image assets with file-names that ends in a single-char label eg.
// "0200_ES_125130_b.tif" (label = b).
const WEIGHT_ASSET_LABLED_FILENAME = '0200';
// Default prefix - placed in the middle of the range.
const WEIGHT_DEFAULT = '0500';

// Maps a asset to a sortable value.
let mapAssetValue = function(asset) {
  let baseName = '';

  if (asset.fileName) {
    baseName = asset.fileName
  } else if (asset.id) {
    baseName = asset.id
  } else {
    throw new Error("Unable to determine search-value for asset");
  }

  // Prefix the sort-value based on the type of asset. The prefix effectivly
  // places the value in a group. Values in the same group are sorted
  // alphabetically.
  if (asset.assetType === 'Rotation') {
    baseName = WEIGHT_ROT + '_' + baseName;
  } else if (asset.assetType === 'Still' && baseName.match(/_\w\.\w{3,4}$/)) {
    baseName = WEIGHT_ASSET_LABLED_FILENAME + '_' + baseName;
  } else {
    baseName = WEIGHT_DEFAULT + '_' + baseName;
  }

  return baseName;
};

// Sorts assets based on a mapped "business" value - see mapAssetValue().
module.exports = function(metadata) {
  if (metadata.related && metadata.related.assets) {
    metadata.related.assets = metadata.related.assets.sort(
      (a, b) => {
        let a_mapped = mapAssetValue(a);
        let b_mapped = mapAssetValue(b);

        if (a_mapped < b_mapped)
          return -1;
        if (a_mapped > b_mapped)
          return 1;
        return 0;
      }
    );
  }

  return metadata;
};
