'use strict';
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.verify =
  exports.sign =
  exports.getKeyPairFromPublicKey =
  exports.getStarkKey =
  exports.getKeyPair =
  exports.genKeyPair =
  exports.ec =
    void 0;
var elliptic_1 = require('elliptic');
var hash_js_1 = __importDefault(require('hash.js'));
var minimalistic_assert_1 = __importDefault(require('minimalistic-assert'));
var constants_1 = require('../constants');
var encode_1 = require('./encode');
var number_1 = require('./number');
exports.ec = new elliptic_1.ec(
  new elliptic_1.curves.PresetCurve({
    type: 'short',
    prime: null,
    p: constants_1.FIELD_PRIME,
    a: '00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000001',
    b: '06f21413 efbe40de 150e596d 72f7a8c5 609ad26c 15c915c1 f4cdfcb9 9cee9e89',
    n: constants_1.EC_ORDER,
    hash: hash_js_1.default.sha256,
    gRed: false,
    g: constants_1.CONSTANT_POINTS[1],
  })
);
/*
 The function _truncateToN in lib/elliptic/ec/index.js does a shift-right of 4 bits
 in some cases. This function does the opposite operation so that
   _truncateToN(fixMessage(msg)) == msg.
*/
function fixMessage(msg) {
  var pureHex = msg.replace(/^0x0*/, '');
  if (pureHex.length <= 62) {
    // In this case, pureHex should not be transformed, as the byteLength() is at most 31,
    // so delta < 0 (see _truncateToN).
    return pureHex;
  }
  (0, minimalistic_assert_1.default)(pureHex.length === 63);
  // In this case delta will be 4 so we perform a shift-left of 4 bits by adding a ZERO_BN.
  return pureHex + '0';
}
exports.genKeyPair = exports.ec.genKeyPair.bind(exports.ec);
function getKeyPair(pk) {
  var pkBn = (0, number_1.toBN)(pk);
  return exports.ec.keyFromPrivate((0, encode_1.removeHexPrefix)((0, number_1.toHex)(pkBn)), 'hex');
}
exports.getKeyPair = getKeyPair;
function getStarkKey(keyPair) {
  // this method needs to be run to generate the .pub property used below
  // the result can be dumped
  keyPair.getPublic(true, 'hex');
  return (0, encode_1.addHexPrefix)(
    (0, encode_1.sanitizeBytes)(keyPair.pub.getX().toString(16), 2)
  );
}
exports.getStarkKey = getStarkKey;
/**
 * Takes a public key and casts it into `elliptic` KeyPair format.
 *
 * @param publicKey - public key which should get casted to a KeyPair
 * @returns keyPair with public key only, which can be used to verify signatures, but cant sign anything
 */
function getKeyPairFromPublicKey(publicKey) {
  var publicKeyBn = (0, number_1.toBN)(publicKey);
  return exports.ec.keyFromPublic(
    (0, encode_1.removeHexPrefix)((0, number_1.toHex)(publicKeyBn)),
    'hex'
  );
}
exports.getKeyPairFromPublicKey = getKeyPairFromPublicKey;
/*
 Signs a message using the provided key.
 key should be an KeyPair with a valid private key.
 Returns an Signature.
*/
function sign(keyPair, msgHash) {
  var msgHashBN = (0, number_1.toBN)((0, encode_1.addHexPrefix)(msgHash));
  // Verify message hash has valid length.
  (0, number_1.assertInRange)(
    msgHashBN,
    constants_1.ZERO,
    (0, number_1.toBN)((0, encode_1.addHexPrefix)(constants_1.MAX_ECDSA_VAL)),
    'msgHash'
  );
  var msgSignature = keyPair.sign(fixMessage(msgHash));
  var r = msgSignature.r,
    s = msgSignature.s;
  var w = s.invm(exports.ec.n);
  // Verify signature has valid length.
  (0, number_1.assertInRange)(
    r,
    constants_1.ONE,
    (0, number_1.toBN)((0, encode_1.addHexPrefix)(constants_1.MAX_ECDSA_VAL)),
    'r'
  );
  (0, number_1.assertInRange)(
    s,
    constants_1.ONE,
    (0, number_1.toBN)((0, encode_1.addHexPrefix)(constants_1.EC_ORDER)),
    's'
  );
  (0, number_1.assertInRange)(
    w,
    constants_1.ONE,
    (0, number_1.toBN)((0, encode_1.addHexPrefix)(constants_1.MAX_ECDSA_VAL)),
    'w'
  );
  return [r.toString(), s.toString()];
}
exports.sign = sign;
function chunkArray(arr, n) {
  return Array(Math.ceil(arr.length / n))
    .fill('')
    .map(function (_, i) {
      return arr.slice(i * n, i * n + n);
    });
}
/*
   Verifies a message using the provided key.
   key should be an KeyPair with a valid public key.
   msgSignature should be an Signature.
   Returns a boolean true if the verification succeeds.
  */
function verify(keyPair, msgHash, sig) {
  var keyPairArray = Array.isArray(keyPair) ? keyPair : [keyPair];
  var msgHashBN = (0, number_1.toBN)((0, encode_1.addHexPrefix)(msgHash));
  (0, minimalistic_assert_1.default)(
    sig.length % 2 === 0,
    'Signature must be an array of length dividable by 2'
  );
  (0, number_1.assertInRange)(
    msgHashBN,
    constants_1.ZERO,
    (0, number_1.toBN)((0, encode_1.addHexPrefix)(constants_1.MAX_ECDSA_VAL)),
    'msgHash'
  );
  (0, minimalistic_assert_1.default)(
    keyPairArray.length === sig.length / 2,
    'Signature and keyPair length must be equal'
  );
  return chunkArray(sig, 2).every(function (_a, i) {
    var _b;
    var _c = __read(_a, 2),
      r = _c[0],
      s = _c[1];
    var rBN = (0, number_1.toBN)(r);
    var sBN = (0, number_1.toBN)(s);
    var w = sBN.invm(exports.ec.n);
    (0,
    number_1.assertInRange)(rBN, constants_1.ONE, (0, number_1.toBN)((0, encode_1.addHexPrefix)(constants_1.MAX_ECDSA_VAL)), 'r');
    (0,
    number_1.assertInRange)(sBN, constants_1.ONE, (0, number_1.toBN)((0, encode_1.addHexPrefix)(constants_1.EC_ORDER)), 's');
    (0,
    number_1.assertInRange)(w, constants_1.ONE, (0, number_1.toBN)((0, encode_1.addHexPrefix)(constants_1.MAX_ECDSA_VAL)), 'w');
    return (_b = exports.ec.verify(fixMessage(msgHash), { r: rBN, s: sBN }, keyPairArray[i])) !==
      null && _b !== void 0
      ? _b
      : false;
  });
}
exports.verify = verify;
