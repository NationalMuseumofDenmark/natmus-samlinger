const assert = require('assert');
const helpers = require('../../shared/helpers');

assert.equal(helpers.cleanDocumentId('AS-123'), 'AS-123');
assert.equal(helpers.cleanDocumentId('AS_1234'), 'AS-1234');
assert.equal(helpers.cleanDocumentId('AS_12345_'), 'AS-12345');
assert.equal(helpers.cleanDocumentId('123456', 'AS'), 'AS-123456');
assert.equal(helpers.cleanDocumentId(1234567, 'AS'), 'AS-1234567');
