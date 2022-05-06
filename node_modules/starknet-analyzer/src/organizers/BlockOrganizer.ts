import { 
    Provider, 
    InvokeFunctionTransaction
} from "starknet";

import { 
    Event,
    GetBlockResponse,
    TransactionReceipt
} from "../types/rawStarknet";
import {
    OrganizedEvent,
    FunctionCall,
    OrganizedTransaction
} from "../types/organizedStarknet";
import { TransactionCallOrganizer } from "./TransactionCallOrganizer";
import { sleep } from "../helpers/helpers";

export class BlockOrganizer extends TransactionCallOrganizer {

    
    constructor(provider: Provider) {
        super(provider);
    }

    async organizeTransactions(block: GetBlockResponse) {
        const transactions = block.transactions;
        const receipts = block.transaction_receipts as TransactionReceipt[];

        let organizedTransactions: OrganizedTransaction[] = [];
        for(const receipt of receipts) {
            if(transactions[receipt.transaction_index].type !== "INVOKE_FUNCTION") continue;
            const tx = transactions[receipt.transaction_index] as InvokeFunctionTransaction;
            
            let events: OrganizedEvent[] = [];
            let functionCalls: FunctionCall[] | undefined;
            for(const event of receipt.events) {
                const contractAnalyzer = await super.getContractOrganizer(event.from_address);
                try {
                    const eventCalldata = contractAnalyzer.organizeEvent(event);
                    if(eventCalldata) {
                        events.push(eventCalldata);
                    }
                } catch(error) {}

                functionCalls = await super.getCalldataPerCallFromTx(tx);
                await sleep(1000);
            }
            organizedTransactions.push({
                hash: receipt.transaction_hash,
                events,
                functionCalls,
                origin: tx.contract_address,
                entrypointSelector: tx.entry_point_selector,
                type: tx.type
            });
        }

        return organizedTransactions;
    }

    // get contracts() {
    //     return this._contracts;
    // }
}