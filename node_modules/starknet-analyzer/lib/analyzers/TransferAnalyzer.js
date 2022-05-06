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
exports.TransferAnalyzer = void 0;
const ethers_1 = require("ethers");
const QueryHelper_1 = require("./QueryHelper");
class TransferAnalyzer extends QueryHelper_1.QueryHelper {
    constructor(provider) {
        super(provider);
        this._transfersPerBlock = {};
    }
    analyzeTransfersInBlock(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            let _transfers = {};
            for (const tx of transactions) {
                for (const event of tx.events) {
                    if (event.name === "Transfer") {
                        const decodedTransfer = yield this.analyzeTransfer(tx, event);
                        _transfers = this.populateTransfersObject(_transfers, decodedTransfer);
                    }
                }
            }
            return _transfers;
        });
    }
    analyzeTransfer(transaction, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const from = event.calldata[0].value;
            const to = event.calldata[1].value;
            const value = ethers_1.BigNumber.from(event.calldata[2].value.low).add(event.calldata[2].value.high);
            const { symbol, decimals } = yield this.getSymbolAndDecimalOfToken(event.transmitterContract);
            return { from, to, value, hash: transaction.hash, symbol, decimals };
        });
    }
    getSymbolAndDecimalOfToken(tokenAddress) {
        const _super = Object.create(null, {
            getSymbolsAndDecimalsOfTokens: { get: () => super.getSymbolsAndDecimalsOfTokens }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const [_symbol, _decimals] = yield _super.getSymbolsAndDecimalsOfTokens.call(this, [tokenAddress]);
            const symbol = _symbol;
            const decimals = +_decimals;
            return { symbol, decimals };
        });
    }
    populateTransfersPerBlock(blockNumber, transfersObj) {
        this._transfersPerBlock[blockNumber] = transfersObj;
    }
    populateTransfersObject(transfers, { from, to, value, hash, symbol, decimals }) {
        let _transfers = transfers;
        _transfers[from] = this._populateSentTransfers(transfers[from], { from, to, value, hash, symbol, decimals });
        _transfers[to] = this._populateReceivedTransfers(transfers[to], { from, to, value, hash, symbol, decimals });
        return _transfers;
    }
    _populateSentTransfers(transfersObj, value) {
        if (!transfersObj || !transfersObj.sent) {
            if (!transfersObj)
                transfersObj = { received: undefined, sent: undefined };
            transfersObj = {
                sent: [value],
                received: transfersObj.received
            };
        }
        else {
            transfersObj.sent.push(value);
        }
        return transfersObj;
    }
    _populateReceivedTransfers(transfersObj, value) {
        if (!transfersObj || !transfersObj.received) {
            if (!transfersObj)
                transfersObj = { received: undefined, sent: undefined };
            transfersObj = {
                received: [value],
                sent: transfersObj.sent
            };
        }
        else {
            transfersObj.received.push(value);
        }
        return transfersObj;
    }
    get transfersPerBlock() {
        return this._transfersPerBlock;
    }
}
exports.TransferAnalyzer = TransferAnalyzer;
//# sourceMappingURL=TransferAnalyzer.js.map