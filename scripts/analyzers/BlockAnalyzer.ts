import { 
    Provider, 
    InvokeFunctionTransaction,
    GetBlockResponse
} from "starknet";
import { BigNumber } from "ethers";
import { Event } from "starknet/dist/types/api";

import {
    OrganizedEvent,
    FunctionCall,
    CallArray,
    OrganizedTransaction
} from "../helpers/types";
import { ContractCallAnalyzer } from "./ContractCallAnalyzer";
import { TransactionCallAnalyzer } from "./TransactionCallAnalyzer";
import { sleep } from "../helpers/helpers";

export class BlockAnalyzer extends TransactionCallAnalyzer {

    private _provider: Provider;
    
    constructor(provider: Provider) {
        super();
        this._provider = provider;
    }

    async getTransactions(block: GetBlockResponse) {
        const transactions = block.transactions;
        const receipts = block.transaction_receipts;

        let organizedTransactions: OrganizedTransaction[] = [];
        for(const receipt of receipts) {
            const tx = transactions[receipt.transaction_index] as InvokeFunctionTransaction;
            let events: OrganizedEvent[] = [];
            let functionCalls: FunctionCall[] | undefined;
            for(const event of receipt.events) {
                const eventCalldata = await this.getEventOutput(event);
                if(eventCalldata) {
                    events.push(eventCalldata);
                }

                functionCalls = await this.getCalldataPerCallFromTx(tx);
                await sleep(2000);
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

    async getCalldataPerCallFromTx(transaction: InvokeFunctionTransaction) {
        const { callArray, rawFnCalldata } = BlockAnalyzer.destructureFunctionCalldata(transaction);
        try {
            const functionCalls = await this.getCalldataPerCall(callArray, rawFnCalldata);
        
            return functionCalls as FunctionCall[];
        } catch(error) {
            return undefined;
        }
    }

    async getEventOutput(event: Event) {
        const { structs, functions, events } = await ContractCallAnalyzer.getContractAbi(event.from_address, this.provider);
        const contractCallAnalyzer = new ContractCallAnalyzer(
            event.from_address,
            structs,
            functions,
            events
        );

        try {
            const structuredEvent = await contractCallAnalyzer.organizeEvent(event);
            return structuredEvent;
        } catch(error) {
            return undefined;
        }
    }

    async getCalldataPerCall(
        callArray: CallArray[],
        fullTxCalldata: BigNumber[]
    ) {
        let rawCalldataIndex = 0;
        let functionCalls = [];
        let contractAnalyzers: { [key: string]: ContractCallAnalyzer } = {};
        for(const call of callArray) {
            const { contractAnalyzer, newContractAnalyzer } = await this.getContractAnalyzer(call.to.toHexString(), contractAnalyzers);
            contractAnalyzers = newContractAnalyzer; 
    
            const { subcalldata, endIndex } = contractAnalyzer.organizeFunctionInput(
                call.selector.toHexString(), 
                { fullCalldataValues: fullTxCalldata, startIndex: rawCalldataIndex }, 
            );
            if(!endIndex && endIndex !== 0) {
                throw new Error(`BlockAnalyzer::getCalldataPerCall - No endIndex returned (endIndex: ${endIndex})`);
            }
            rawCalldataIndex = endIndex;
            functionCalls.push({
                name: contractAnalyzer.getFunctionAbiFromSelector(call.selector.toHexString()).name,
                to: call.to,
                calldata: subcalldata
            });
        }
        return functionCalls;
    }
    
    async getContractAnalyzer(
        address: string, 
        contractAnalyzers: { [key: string]: ContractCallAnalyzer }
    ) {
    
        // store contract to avoid fetching the same contract twice for the same function call
        if(!contractAnalyzers[address]) {
            const { functions, structs, events } = await ContractCallAnalyzer.getContractAbi(address, this.provider);
            let newContractAnalyzer = contractAnalyzers;
            newContractAnalyzer[address] = new ContractCallAnalyzer(address, structs, functions, events);
            return { contractAnalyzer: newContractAnalyzer[address], newContractAnalyzer };
        } else {
            return { contractAnalyzer: contractAnalyzers[address], newContractAnalyzer: contractAnalyzers };
        }
    
    }

    get provider() {
        return this._provider;
    }
}