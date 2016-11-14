module.exports = (metadata) => {
  // Remap for easier backwards compability + dots within asset.json
  // doesn't seem to work
  metadata.width_px = metadata.file.dimensions.width;
  metadata.height_px = metadata.file.dimensions.height;

  // Cleanup
  delete metadata.file.dimensions.width;
  delete metadata.file.dimensions.height;

  // Return
  return metadata;
};
