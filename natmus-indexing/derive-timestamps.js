'use strict';

module.exports = (metadata) => {
  if(metadata.date) {
    Object.keys(metadata.date).forEach(function(type) {
      var dateInterval = metadata.date[type];
      if(dateInterval) {
        Object.keys(dateInterval).forEach(function(point) {
          var date = dateInterval[point];
          if(date && (date.year || date.month || date.day)) {
            if(date.month === 0 && point == 'from') {
              date.month = 1; // Assume january
            } else if(date.month === 0 && point == 'to') {
              date.month = 12; // Assume december
            }
            if(date.day === 0 && point == 'from') {
              date.day = 1;
            } else if(date.month === 0 && point == 'to') {
              date.day = 31;
            }
            if(date.year && date.month && date.day) {
              date.timestamp = [date.year, date.month, date.day].join('/');
            }
          }
        });
      }
    });
  }
  return metadata;
};
