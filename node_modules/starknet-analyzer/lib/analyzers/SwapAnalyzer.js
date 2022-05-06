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
exports.SwapAnalyzer = void 0;
const shortString_1 = require("starknet/dist/utils/shortString");
const helpers_1 = require("../helpers/helpers");
const TransferAnalyzer_1 = require("./TransferAnalyzer");
class SwapAnalyzer extends TransferAnalyzer_1.TransferAnalyzer {
    constructor(provider) {
        super(provider);
        this._ALPHA_ROAD_FACTORY = "0x373c71f077b96cbe7a57225cd503d29cadb0056ed741a058094234d82de2f9";
        this._swappersPerBlock = {};
    }
    analyzeSwapsInBlock(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            let _swappers = {};
            for (const tx of transactions) {
                for (const event of tx.events) {
                    if (event.name === "Swap") {
                        const decodedSwap = yield this.analyzeSwap(event);
                        _swappers = this.populateSwappersObject(_swappers, decodedSwap);
                    }
                }
            }
            return _swappers;
        });
    }
    analyzeSwap(event) {
        const _super = Object.create(null, {
            getToken0AndToken1: { get: () => super.getToken0AndToken1 },
            getFactoryAddr: { get: () => super.getFactoryAddr },
            getSymbol: { get: () => super.getSymbol }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const { token0, token1 } = yield _super.getToken0AndToken1.call(this, event.transmitterContract);
            const factoryAddr = yield _super.getFactoryAddr.call(this, event.transmitterContract);
            const symbol = yield _super.getSymbol.call(this, event.transmitterContract);
            let decodedSwap;
            if (symbol && token0 && token1 && (0, shortString_1.decodeShortString)(symbol) === "MGP") { // Mesh Finance Event Implementation
                decodedSwap = yield this.interpretMeshSwap(event.calldata, token0, token1);
            }
            else if (factoryAddr === this.ALPHA_ROAD_FACTORY) { // Alpha Road Implementation
                decodedSwap = yield this.interpretAlphaRoadSwap(event.calldata);
            }
            else {
                decodedSwap = yield this.interpretAlphaRoadSwap(event.calldata);
            }
            yield this.sleep(1000);
            return decodedSwap;
        });
    }
    /**
     * @dev The JediSwap team puts amounts0In and amounts1In in the event object. On of those will not be equal to 0,
     * this mean that this is the token that was sent in. Same for the tokenOut.
     * If token0 is tokenIn, then token1 is tokenOut, so I only check if tokenIn = token0 or token1 and I deduce tokenOut.
     * @param calldata - Calldata of the organized event associated to the transaction
     * @param token0 - address of the token0
     * @param token1 - address of the token1
     * @returns an organized swap object
     */
    interpretMeshSwap(calldata, token0, token1) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token0Decimals, token1Decimals, token0Symbol, token1Symbol } = yield this.getToken0AndToken1SymbolAndDecimals(token0, token1);
            if (!(0, helpers_1.uint256ToBN)(calldata[1].value).eq(0)) { // calldata[1].value = amount0In is amountIn
                return {
                    swapperAddress: calldata[5].value,
                    tokenIn: {
                        amount: (0, helpers_1.uint256ToBN)(calldata[1].value),
                        address: token0,
                        symbol: token0Symbol,
                        decimals: token0Decimals
                    },
                    tokenOut: {
                        amount: (0, helpers_1.uint256ToBN)(calldata[4].value),
                        address: token1,
                        symbol: token1Symbol,
                        decimals: token1Decimals
                    }
                };
            }
            else { // calldata[1].value = amount1In is amountIn
                return {
                    swapperAddress: calldata[5].value,
                    tokenIn: {
                        amount: (0, helpers_1.uint256ToBN)(calldata[2].value),
                        address: token1,
                        symbol: token1Symbol,
                        decimals: token1Decimals
                    },
                    tokenOut: {
                        amount: (0, helpers_1.uint256ToBN)(calldata[3].value),
                        address: token0,
                        symbol: token0Symbol,
                        decimals: token0Decimals
                    }
                };
            }
        });
    }
    interpretAlphaRoadSwap(calldata) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token0Decimals, token1Decimals, token0Symbol, token1Symbol } = yield this.getToken0AndToken1SymbolAndDecimals(calldata[1].value, calldata[2].value);
            let tokenInSymb;
            let tokenInDecimals;
            let tokenOutSymb;
            let tokenOutDecimals;
            if (calldata[1].value === calldata[1].value) {
                tokenInSymb = token0Symbol;
                tokenInDecimals = token0Decimals;
                tokenOutSymb = token1Symbol;
                tokenOutDecimals = token1Decimals;
            }
            else {
                tokenInSymb = token1Symbol;
                tokenInDecimals = token1Decimals;
                tokenOutSymb = token0Symbol;
                tokenOutDecimals = token0Decimals;
            }
            return {
                swapperAddress: calldata[0].value,
                tokenIn: {
                    amount: (0, helpers_1.uint256ToBN)(calldata[3].value),
                    address: calldata[1].value,
                    symbol: tokenInSymb,
                    decimals: tokenInDecimals
                },
                tokenOut: {
                    amount: (0, helpers_1.uint256ToBN)(calldata[4].value),
                    address: calldata[2].value,
                    symbol: tokenOutSymb,
                    decimals: tokenOutDecimals
                }
            };
        });
    }
    getToken0AndToken1SymbolAndDecimals(token0Address, token1Address) {
        const _super = Object.create(null, {
            getSymbolsAndDecimalsOfTokens: { get: () => super.getSymbolsAndDecimalsOfTokens }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.getSymbolsAndDecimalsOfTokens.call(this, [token0Address, token1Address]);
            const token0Symbol = res[0];
            const token0Decimals = +res[1];
            const token1Symbol = res[2];
            const token1Decimals = +res[3];
            return {
                token0Symbol,
                token0Decimals,
                token1Symbol,
                token1Decimals,
            };
        });
    }
    populateSwappersObject(swapObj, value) {
        if (!swapObj[value.swapperAddress]) {
            swapObj[value.swapperAddress] = [value];
        }
        else {
            swapObj[value.swapperAddress].push(value);
        }
        return swapObj;
    }
    populateSwappersPerBlock(blockNumber, swappersObj) {
        this._swappersPerBlock[blockNumber] = swappersObj;
    }
    get swappersPerBlock() {
        return this._swappersPerBlock;
    }
    get ALPHA_ROAD_FACTORY() {
        return this._ALPHA_ROAD_FACTORY;
    }
}
exports.SwapAnalyzer = SwapAnalyzer;
//# sourceMappingURL=SwapAnalyzer.js.map