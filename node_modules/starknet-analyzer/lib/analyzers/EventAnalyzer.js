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
exports.EventAnalyzer = void 0;
const SwapAnalyzer_1 = require("./SwapAnalyzer");
const BlockOrganizer_1 = require("../organizers/BlockOrganizer");
const helpers_1 = require("../helpers/helpers");
class EventAnalyzer extends SwapAnalyzer_1.SwapAnalyzer {
    constructor(provider) {
        super(provider);
    }
    analyzeEventsInBlock(blockNumber) {
        const _super = Object.create(null, {
            populateSwappersObject: { get: () => super.populateSwappersObject },
            populateTransfersObject: { get: () => super.populateTransfersObject },
            populateSwappersPerBlock: { get: () => super.populateSwappersPerBlock },
            populateTransfersPerBlock: { get: () => super.populateTransfersPerBlock },
            swappersPerBlock: { get: () => super.swappersPerBlock },
            transfersPerBlock: { get: () => super.transfersPerBlock }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const blockAnalyzer = new BlockOrganizer_1.BlockOrganizer(this.provider);
            const _block = yield this.provider.getBlock(blockNumber);
            const block = (0, helpers_1.forceCast)(_block);
            const transactions = yield blockAnalyzer.organizeTransactions(block);
            let _swappers = {};
            let _transfers = {};
            for (const tx of transactions) {
                for (const event of tx.events) {
                    if (event.name === "Swap") {
                        const organizedSwap = yield this.analyzeSwap(event);
                        _swappers = _super.populateSwappersObject.call(this, _swappers, organizedSwap);
                    }
                    if (event.name === "Transfer") {
                        const organizedTransfer = yield this.analyzeTransfer(tx, event);
                        _transfers = _super.populateTransfersObject.call(this, _transfers, organizedTransfer);
                    }
                }
            }
            _super.populateSwappersPerBlock.call(this, blockNumber, _swappers);
            _super.populateTransfersPerBlock.call(this, blockNumber, _transfers);
            return { swaps: _super.swappersPerBlock[blockNumber], transfers: _super.transfersPerBlock[blockNumber] };
        });
    }
}
exports.EventAnalyzer = EventAnalyzer;
//# sourceMappingURL=EventAnalyzer.js.map