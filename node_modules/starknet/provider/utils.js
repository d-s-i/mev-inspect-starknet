'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getFormattedBlockIdentifier =
  exports.getBlockIdentifier =
  exports.txIdentifier =
  exports.formatHash =
    void 0;
var number_1 = require('../utils/number');
/**
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/fc97bdd8322a7df043c87c371634b26c15ed6cee/src/starkware/starknet/services/api/feeder_gateway/feeder_gateway_client.py#L148-L153)
 *
 * @param hashValue
 * @param hashField
 */
function formatHash(hashValue) {
  if (typeof hashValue === 'string') return hashValue;
  return (0, number_1.toHex)((0, number_1.toBN)(hashValue));
}
exports.formatHash = formatHash;
/**
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/fc97bdd8322a7df043c87c371634b26c15ed6cee/src/starkware/starknet/services/api/feeder_gateway/feeder_gateway_client.py#L156-L161)
 * @param txHash
 * @param txId
 */
function txIdentifier(txHash, txId) {
  if (!txHash) {
    return 'transactionId=' + JSON.stringify(txId);
  }
  var hashString = formatHash(txHash);
  return 'transactionHash=' + hashString;
}
exports.txIdentifier = txIdentifier;
/**
 * Identifies the block to be queried.
 *
 * @param blockIdentifier - block identifier
 * @returns block identifier object
 */
function getBlockIdentifier(blockIdentifier) {
  if (blockIdentifier === null) {
    return { type: 'BLOCK_NUMBER', data: null };
  }
  if (blockIdentifier === 'pending') {
    return { type: 'BLOCK_NUMBER', data: 'pending' };
  }
  if (typeof blockIdentifier === 'number') {
    return { type: 'BLOCK_NUMBER', data: blockIdentifier };
  }
  if (typeof blockIdentifier === 'string' && blockIdentifier.startsWith('0x')) {
    return { type: 'BLOCK_HASH', data: blockIdentifier };
  }
  if (typeof blockIdentifier === 'string' && !Number.isNaN(parseInt(blockIdentifier, 10))) {
    return { type: 'BLOCK_NUMBER', data: parseInt(blockIdentifier, 10) };
  }
  if (typeof blockIdentifier === 'string') {
    throw new Error('Invalid block identifier: ' + blockIdentifier);
  }
  return { type: 'BLOCK_HASH', data: blockIdentifier };
}
exports.getBlockIdentifier = getBlockIdentifier;
/**
 * Gets the block identifier for API request
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/fc97bdd8322a7df043c87c371634b26c15ed6cee/src/starkware/starknet/services/api/feeder_gateway/feeder_gateway_client.py#L164-L173)
 *
 * @param blockIdentifier
 * @returns block identifier for API request
 */
function getFormattedBlockIdentifier(blockIdentifier) {
  if (blockIdentifier === void 0) {
    blockIdentifier = null;
  }
  var blockIdentifierObject = getBlockIdentifier(blockIdentifier);
  if (blockIdentifierObject.type === 'BLOCK_NUMBER' && blockIdentifierObject.data === null) {
    return '';
  }
  if (blockIdentifierObject.type === 'BLOCK_NUMBER') {
    return 'blockNumber=' + blockIdentifierObject.data;
  }
  return 'blockHash=' + (0, number_1.toHex)((0, number_1.toBN)(blockIdentifierObject.data));
}
exports.getFormattedBlockIdentifier = getFormattedBlockIdentifier;
