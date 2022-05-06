'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getMessageHash =
  exports.getStructHash =
  exports.encodeData =
  exports.getTypeHash =
  exports.encodeType =
  exports.getDependencies =
    void 0;
var hash_1 = require('../hash');
var number_1 = require('../number');
var shortString_1 = require('../shortString');
var utils_1 = require('./utils');
__exportStar(require('./types'), exports);
function getHex(value) {
  try {
    return (0, number_1.toHex)((0, number_1.toBN)(value));
  } catch (e) {
    if (typeof value === 'string') {
      return (0, number_1.toHex)((0, number_1.toBN)((0, shortString_1.encodeShortString)(value)));
    }
    throw new Error('Invalid BigNumberish: ' + value);
  }
}
/**
 * Get the dependencies of a struct type. If a struct has the same dependency multiple times, it's only included once
 * in the resulting array.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {string[]} [dependencies]
 * @return {string[]}
 */
var getDependencies = function (typedData, type, dependencies) {
  if (dependencies === void 0) {
    dependencies = [];
  }
  // `getDependencies` is called by most other functions, so we validate the JSON schema here
  if (!(0, utils_1.validateTypedData)(typedData)) {
    throw new Error('Typed data does not match JSON schema');
  }
  if (dependencies.includes(type)) {
    return dependencies;
  }
  if (!typedData.types[type]) {
    return dependencies;
  }
  return __spreadArray(
    [type],
    __read(
      typedData.types[type].reduce(function (previous, t) {
        return __spreadArray(
          __spreadArray([], __read(previous), false),
          __read(
            (0, exports.getDependencies)(typedData, t.type, previous).filter(function (dependency) {
              return !previous.includes(dependency);
            })
          ),
          false
        );
      }, [])
    ),
    false
  );
};
exports.getDependencies = getDependencies;
/**
 * Encode a type to a string. All dependant types are alphabetically sorted.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @return {string}
 */
var encodeType = function (typedData, type) {
  var _a = __read((0, exports.getDependencies)(typedData, type)),
    primary = _a[0],
    dependencies = _a.slice(1);
  var types = __spreadArray([primary], __read(dependencies.sort()), false);
  return types
    .map(function (dependency) {
      return (
        dependency +
        '(' +
        typedData.types[dependency].map(function (t) {
          return t.name + ':' + t.type;
        }) +
        ')'
      );
    })
    .join('');
};
exports.encodeType = encodeType;
/**
 * Get a type string as hash.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @return {string}
 */
var getTypeHash = function (typedData, type) {
  return (0, hash_1.getSelectorFromName)((0, exports.encodeType)(typedData, type));
};
exports.getTypeHash = getTypeHash;
/**
 * Encodes a single value to an ABI serialisable string, number or Buffer. Returns the data as tuple, which consists of
 * an array of ABI compatible types, and an array of corresponding values.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {any} data
 * @returns {[string, string]}
 */
var encodeValue = function (typedData, type, data) {
  if (typedData.types[type]) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return [type, (0, exports.getStructHash)(typedData, type, data)];
  }
  if (type === 'felt*') {
    return ['felt*', (0, hash_1.computeHashOnElements)(data)];
  }
  return [type, getHex(data)];
};
/**
 * Encode the data to an ABI encoded Buffer. The data should be a key -> value object with all the required values. All
 * dependant types are automatically encoded.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {Record<string, any>} data
 */
var encodeData = function (typedData, type, data) {
  var _a = __read(
      typedData.types[type].reduce(
        function (_a, field) {
          var _b = __read(_a, 2),
            ts = _b[0],
            vs = _b[1];
          if (data[field.name] === undefined || data[field.name] === null) {
            throw new Error("Cannot encode data: missing data for '" + field.name + "'");
          }
          var value = data[field.name];
          var _c = __read(encodeValue(typedData, field.type, value), 2),
            t = _c[0],
            encodedValue = _c[1];
          return [
            __spreadArray(__spreadArray([], __read(ts), false), [t], false),
            __spreadArray(__spreadArray([], __read(vs), false), [encodedValue], false),
          ];
        },
        [['felt'], [(0, exports.getTypeHash)(typedData, type)]]
      ),
      2
    ),
    types = _a[0],
    values = _a[1];
  return [types, values];
};
exports.encodeData = encodeData;
/**
 * Get encoded data as a hash. The data should be a key -> value object with all the required values. All dependant
 * types are automatically encoded.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {Record<string, any>} data
 * @return {Buffer}
 */
var getStructHash = function (typedData, type, data) {
  return (0, hash_1.computeHashOnElements)((0, exports.encodeData)(typedData, type, data)[1]);
};
exports.getStructHash = getStructHash;
/**
 * Get the EIP-191 encoded message to sign, from the typedData object. If `hash` is enabled, the message will be hashed
 * with Keccak256.
 *
 * @param {TypedData} typedData
 * @param {BigNumberish} account
 * @return {string}
 */
var getMessageHash = function (typedData, account) {
  var message = [
    (0, shortString_1.encodeShortString)('StarkNet Message'),
    (0, exports.getStructHash)(typedData, 'StarkNetDomain', typedData.domain),
    account,
    (0, exports.getStructHash)(typedData, typedData.primaryType, typedData.message),
  ];
  return (0, hash_1.computeHashOnElements)(message);
};
exports.getMessageHash = getMessageHash;
