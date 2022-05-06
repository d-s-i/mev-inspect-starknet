'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.decodeShortString =
  exports.encodeShortString =
  exports.isShortString =
  exports.isASCII =
    void 0;
var encode_1 = require('./encode');
function isASCII(str) {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(str);
}
exports.isASCII = isASCII;
// function to check if string has less or equal 31 characters
function isShortString(str) {
  return str.length <= 31;
}
exports.isShortString = isShortString;
function encodeShortString(str) {
  if (!isASCII(str)) throw new Error(str + ' is not an ASCII string');
  if (!isShortString(str)) throw new Error(str + ' is too long');
  return (0, encode_1.addHexPrefix)(
    str.replace(/./g, function (char) {
      return char.charCodeAt(0).toString(16);
    })
  );
}
exports.encodeShortString = encodeShortString;
function decodeShortString(str) {
  return (0, encode_1.removeHexPrefix)(str).replace(/.{2}/g, function (hex) {
    return String.fromCharCode(parseInt(hex, 16));
  });
}
exports.decodeShortString = decodeShortString;
