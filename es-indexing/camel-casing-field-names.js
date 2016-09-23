
function caplitalize(word) {
  if(word.length > 0) {
    return word.charAt(0).toUpperCase() + word.substr(1);
  } else {
    return word;
  }
}

function generateFieldName(field) {
  var words = field.split('_');
  for(var w = 1; w < words.length; w++) {
    words[w] = caplitalize(words[w]);
  }
  return words.join('');
}

module.exports = (metadata) => {
  Object.keys(metadata).forEach((field) => {
    var newField = generateFieldName(field);
    if(field !== newField) {
      metadata[newField] = metadata[field];
      delete metadata[field];
    }
  });
  return metadata;
};
