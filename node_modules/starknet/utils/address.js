'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateAndParseAddress = exports.addAddressPadding = void 0;
var constants_1 = require('../constants');
var encode_1 = require('./encode');
var number_1 = require('./number');
function addAddressPadding(address) {
  return (0, encode_1.addHexPrefix)((0, encode_1.removeHexPrefix)(address).padStart(64, '0'));
}
exports.addAddressPadding = addAddressPadding;
function validateAndParseAddress(address) {
  if (typeof address !== 'string') {
    throw new Error('Invalid Address Type');
  }
  (0, number_1.assertInRange)(address, constants_1.ZERO, constants_1.MASK_251, 'Starknet Address');
  var result = addAddressPadding(address);
  if (!result.match(/^(0x)?[0-9a-fA-F]{64}$/)) {
    throw new Error('Invalid Address Format');
  }
  return result;
}
exports.validateAndParseAddress = validateAndParseAddress;
