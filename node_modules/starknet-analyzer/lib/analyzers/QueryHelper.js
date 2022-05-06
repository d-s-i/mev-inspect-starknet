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
exports.QueryHelper = void 0;
const ethers_1 = require("ethers");
class QueryHelper {
    constructor(provider) {
        this._provider = provider;
        this._tokens = {};
        this._pairs = {};
        this._factoriesAddresses = {};
    }
    query(contractAddress, entrypoint, calldata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._query(contractAddress, entrypoint, calldata);
            }
            catch (error) {
                return undefined;
            }
        });
    }
    getFactoryAddr(lpTokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.factoriesAddresses[lpTokenAddress]) {
                return this.factoriesAddresses[lpTokenAddress];
            }
            else {
                let _factoryAddress = yield this.query(lpTokenAddress, "getFactory");
                if (_factoryAddress !== undefined) {
                    const factoryAddress = _factoryAddress[0];
                    this.factoriesAddresses[lpTokenAddress] = factoryAddress;
                    return factoryAddress;
                }
                else {
                    return undefined;
                }
            }
        });
    }
    getSymbol(_tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenAddress = ethers_1.BigNumber.from(_tokenAddress).toHexString();
            if (this.tokens[tokenAddress] && this.tokens[tokenAddress].symbol) {
                return this.tokens[tokenAddress].symbol;
            }
            else {
                const _symbol = yield this.query(tokenAddress, "symbol");
                const symbol = _symbol ? _symbol[0] : undefined;
                if (!this.tokens[tokenAddress]) {
                    this.tokens[tokenAddress] = { symbol: symbol || tokenAddress, decimals: 0 };
                }
                else {
                    this.tokens[tokenAddress] = { symbol: symbol || tokenAddress, decimals: this.tokens[tokenAddress].decimals || 0 };
                }
                return symbol;
            }
        });
    }
    getToken0AndToken1(contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pairs[contractAddress]) {
                return this.pairs[contractAddress];
            }
            else {
                try {
                    const results = yield Promise.all([
                        this.query(contractAddress, "token0"),
                        this.query(contractAddress, "token1"),
                    ]);
                    this.checkResultIsDefined(results);
                    this.pairs[contractAddress] = { token0: results[0][0], token1: results[1][0] };
                    return this.pairs[contractAddress];
                }
                catch (error) {
                    this.pairs[contractAddress] = { token0: undefined, token1: undefined };
                    return { token0: undefined, token1: undefined };
                }
            }
        });
    }
    getSymbolsAndDecimalsOfTokens(tokensAddresses) {
        return __awaiter(this, void 0, void 0, function* () {
            let isAlreadyQueried = [];
            let queries = [];
            for (const addr of tokensAddresses) {
                if (this.tokens[addr]) {
                    isAlreadyQueried.push(true);
                    queries.push(this.tokens[addr].symbol, this.tokens[addr].decimals);
                }
            }
            if (!isAlreadyQueried.includes(false)) {
                return queries;
            }
            try {
                let promises = [];
                for (const addr of tokensAddresses) {
                    promises.push(this._query(addr, "symbol"));
                    promises.push(this._query(addr, "decimals"));
                }
                const _results = yield Promise.all(promises);
                const results = _results.map(res => res[0]);
                this.checkResultIsDefined(results);
                let iterations = 0;
                for (let i = 0; i < results.length; i = i + 2) {
                    this.writeSymbolAndDecimals(tokensAddresses[iterations], { symbol: results[i], decimals: +results[i + 1] });
                }
                return results;
            }
            catch (error) {
                let tokensData = [];
                for (const addr of tokensAddresses) {
                    tokensData.push(addr);
                    tokensData.push(0);
                    this.writeSymbolAndDecimals(addr, { symbol: addr, decimals: 0 });
                }
                return tokensData;
            }
        });
    }
    writeSymbolAndDecimals(index, value) {
        this.tokens[index] = value;
    }
    checkResultIsDefined(results) {
        results.forEach((res, i) => {
            if (!res)
                throw new Error(`QueryHelper::checkResult - result at index ${i} is undefined (value of res[${i}]: ${res})`);
        });
    }
    sleep(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, ms));
        });
    }
    _query(contractAddress, entrypoint, calldata) {
        return __awaiter(this, void 0, void 0, function* () {
            const { result: query } = yield this.provider.callContract({
                contractAddress: contractAddress,
                entrypoint: entrypoint,
                calldata: calldata || []
            });
            return query;
        });
    }
    get provider() {
        return this._provider;
    }
    get tokens() {
        return this._tokens;
    }
    get pairs() {
        return this._pairs;
    }
    get factoriesAddresses() {
        return this._factoriesAddresses;
    }
}
exports.QueryHelper = QueryHelper;
//# sourceMappingURL=QueryHelper.js.map