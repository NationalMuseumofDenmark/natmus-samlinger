module.exports = (metadata) => {
  if(metadata.type === 'asset') {
    // Remap for easier backwards compability + dots within asset.json
    // doesn't seem to work
    metadata.width_px = metadata.file.dimensions.width;
    metadata.height_px = metadata.file.dimensions.height;
  }

  // Return
  return metadata;
};
