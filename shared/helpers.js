let helpers = require('collections-online/shared/helpers');

helpers.documentTitle = (metadata) => {
  let title = 'Dokument med ukendt type';
  if (metadata.type === 'asset') {
    title = metadata.text['da-DK'].title || 'Billede uden titel';
  } else if(metadata.type === 'object') {
    title = metadata.workDescription || 'Genstand uden titel';
  }
  return helpers.capitalizeFirstLetter(title);
};

helpers.documentDescription = (metadata) => {
  let description = '';
  if (metadata.type === 'asset') {
    description = metadata.text['da-DK'].description ||
                  'Billede uden beskrivelse';
  } else if(metadata.type === 'object') {
    let dimensions = metadata.dimensions || [];
    description = dimensions
      .map(dimension => dimension.overallDescription)
      .join(', ');
    description = description || 'Genstand uden beskrivelse';
  }
  return helpers.capitalizeFirstLetter(description);
};

module.exports = helpers;
