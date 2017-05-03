const config = require('collections-online/lib/config');
const _ = require('lodash');
const cumulus = require('collections-online-cumulus/controllers/motif-tagging');

const natmusApi = require('../services/natmus-api');

module.exports.typeaheadSuggestions = (text) => {
  const ds = require('collections-online/lib/services/documents');
  return ds.search({
    'size': 0,
    'body': {
      'aggs': {
        'verified_subject': {
          'terms': {
            'field': 'tags.verified.subject.keyword',
            'include': text + '.*'
          }
        },
        'verified_location': {
          'terms': {
            'field': 'tags.verified.location.keyword',
            'include': text + '.*'
          }
        },
        'verified_theme': {
          'terms': {
            'field': 'tags.verified.theme.keyword',
            'include': text + '.*'
          }
        },
        'verified_time': {
          'terms': {
            'field': 'tags.verified.time.keyword',
            'include': text + '.*'
          }
        },
        'crowd': {
          'terms': {
            'field': 'tags.crowd.keyword',
            'include': text + '.*'
          }
        },
        'automated': {
          'terms': {
            'field': 'tags.automated.keyword',
            'include': text + '.*'
          }
        }
      }
    }
  }).then(function(response) {
    let tags = _.concat(
      response.aggregations.verified_subject.buckets,
      response.aggregations.verified_location.buckets,
      response.aggregations.verified_theme.buckets,
      response.aggregations.verified_time.buckets,
      response.aggregations.crowd.buckets,
      response.aggregations.automated.buckets
    ).map(bucket => bucket.key);

    tags.sort(function(tagA, tagB) {
      return tagB.doc_count - tagA.doc_count;
    }).map(function(tag) {
      return tag.key;
    });

    // Iron out duplicates
    return _.uniq(tags);
  });
};

module.exports.save = (metadata) => {
  const id = metadata.collection + '-' + metadata.id;
  // Expect changes - to detect a change
  return natmusApi.expectChanges('asset', id)
  .then((currentMetadata) => {
    // Save it ..
    return cumulus.save(metadata);
  });
};

module.exports.updateIndex = (metadata) => {
  const id = metadata.collection + '-' + metadata.id;
  return natmusApi.pollForChange('asset', id)
  .then(result => {
    if(result.status === 'success') {
      return metadata;
    } else {
      throw new Error('Error updating the index');
    }
  });
};
