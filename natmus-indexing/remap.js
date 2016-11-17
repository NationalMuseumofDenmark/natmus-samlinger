module.exports = (metadata) => {

  if(metadata.type === 'asset') {
    let dimensions = metadata.file.dimensions;
    metadata.width_px = dimensions.width; // Remap because API
    metadata.height_px = dimensions.height; // Remap because API
    metadata.width_cm = dimensions.width / dimensions.ppi * 2.54;
    metadata.height_cm = dimensions.height / dimensions.ppi * 2.54;

    // More remap because API changes
    metadata.title = metadata.text['da-DK'].title;
  } else if(metadata.type === 'object') {
    metadata.title = metadata.workDescription;
  }

  // Return
  return metadata;
};
