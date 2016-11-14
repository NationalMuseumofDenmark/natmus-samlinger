module.exports = (metadata) => {
  if(metadata.type === 'asset') {
    metadata.width_px = metadata.file.dimensions.width;
    metadata.height_px = metadata.file.dimensions.height;
  }
  return metadata;
};
