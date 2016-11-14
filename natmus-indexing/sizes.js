module.exports = (metadata) => {
  metadata.width_px = metadata.file.dimensions.width;
  metadata.height_px = metadata.file.dimensions.height;
  return metadata;
};
