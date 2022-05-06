import { Provider } from "starknet";
import { SwapAnalyzer } from "./SwapAnalyzer";
import { BlockOrganizer } from "../organizers/BlockOrganizer";
import { forceCast } from "../helpers/helpers";
import { SwappersTree, TransfersTreePerAccount } from "../types/organizedStarknet";
import { GetBlockResponse } from "../types/rawStarknet";

export class EventAnalyzer extends SwapAnalyzer {

    constructor(provider: Provider) {
        super(provider);
    }

    async analyzeEventsInBlock(blockNumber: number) {
        const blockAnalyzer = new BlockOrganizer(this.provider);
        const _block = await this.provider.getBlock(blockNumber);
        const block = forceCast(_block) as GetBlockResponse;
        const transactions = await blockAnalyzer.organizeTransactions(block);

        let _swappers: SwappersTree = {};
        let _transfers: TransfersTreePerAccount = {};
        for(const tx of transactions) {
            for(const event of tx.events) {
                if(event.name === "Swap") {
                    const organizedSwap = await this.analyzeSwap(event);
                    _swappers = super.populateSwappersObject(_swappers, organizedSwap);
                }
                if(event.name === "Transfer") {
                    const organizedTransfer = await this.analyzeTransfer(tx, event);
                    _transfers = super.populateTransfersObject(_transfers, organizedTransfer);
                }
            }
        }

        super.populateSwappersPerBlock(blockNumber, _swappers);
        super.populateTransfersPerBlock(blockNumber, _transfers);

        return { swaps: super.swappersPerBlock[blockNumber], transfers: super.transfersPerBlock[blockNumber] };
    }
    
}