'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.STARKNET_TYPED_DATA_TYPE =
  exports.STARKNET_DOMAIN_TYPE =
  exports.STARKNET_TYPE =
  exports.isValidType =
  exports.ATOMIC_TYPES =
    void 0;
var superstruct_1 = require('superstruct');
exports.ATOMIC_TYPES = ['felt', 'felt*'];
// Source: https://github.com/Mrtenz/eip-712/blob/master/src/eip-712.ts
// and modified to support starknet types
/**
 * Checks if a type is valid with the given `typedData`. The following types are valid:
 * - Atomic types: felt, felt*
 * - Reference types: struct type (e.g. SomeStruct)
 *
 * @param {Record<string, unknown>} types
 * @param {string} type
 * @return {boolean}
 */
var isValidType = function (types, type) {
  if (exports.ATOMIC_TYPES.includes(type)) {
    return true;
  }
  if (types[type]) {
    return true;
  }
  return false;
};
exports.isValidType = isValidType;
var TYPE = (0, superstruct_1.refine)((0, superstruct_1.string)(), 'Type', function (type, context) {
  return (0, exports.isValidType)(context.branch[0].types, type);
});
exports.STARKNET_TYPE = (0, superstruct_1.object)({
  name: (0, superstruct_1.string)(),
  type: TYPE,
});
exports.STARKNET_DOMAIN_TYPE = (0, superstruct_1.object)({
  name: (0, superstruct_1.optional)((0, superstruct_1.string)()),
  version: (0, superstruct_1.optional)((0, superstruct_1.string)()),
  chainId: (0, superstruct_1.optional)(
    (0, superstruct_1.union)([(0, superstruct_1.string)(), (0, superstruct_1.number)()])
  ),
});
exports.STARKNET_TYPED_DATA_TYPE = (0, superstruct_1.object)({
  types: (0, superstruct_1.intersection)([
    (0, superstruct_1.type)({ StarkNetDomain: (0, superstruct_1.array)(exports.STARKNET_TYPE) }),
    (0, superstruct_1.record)(
      (0, superstruct_1.string)(),
      (0, superstruct_1.array)(exports.STARKNET_TYPE)
    ),
  ]),
  primaryType: (0, superstruct_1.string)(),
  domain: exports.STARKNET_DOMAIN_TYPE,
  message: (0, superstruct_1.object)(),
});
