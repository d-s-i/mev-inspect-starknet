"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceCast = exports.uint256ToBN = exports.getFullSelector = exports.sleep = void 0;
const ethers_1 = require("ethers");
const hash_1 = require("starknet/utils/hash");
const sleep = function (ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
};
exports.sleep = sleep;
const getFullSelector = function (entrypoint) {
    return ethers_1.BigNumber.from((0, hash_1.getSelectorFromName)(entrypoint)).toHexString();
};
exports.getFullSelector = getFullSelector;
const uint256ToBN = function (num) {
    return ethers_1.BigNumber.from(num.low).add(num.high);
};
exports.uint256ToBN = uint256ToBN;
function forceCast(input) {
    return input;
}
exports.forceCast = forceCast;
//# sourceMappingURL=helpers.js.map