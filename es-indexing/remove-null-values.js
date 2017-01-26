
module.exports = (metadata) => {
  Object.keys(metadata).forEach((key) => {
    if(metadata[key] === null) {
      delete metadata[key];
    }
  });
  return metadata;
};
