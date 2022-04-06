import { defaultProvider, number } from "starknet";
import { 
    InvokeFunctionTransaction, 
} from "starknet/types/index";
import {
    getCalldataPerFunctionFromTx,
    getEventCalldata
} from "./helpers/onchainHelpers";
import { sleep } from "./helpers/helpers";
import { 
    SWAP_SELECTOR
} from "./helpers/constants";

const FILE_PATH = "scripts/analyzeArbitrages";

const analyzeBlock = async function(startBlockNumber: number, endBlockNumber: number) {
    for(let i = startBlockNumber; i <= endBlockNumber; i++) {
        const block = await defaultProvider.getBlock(i);
        const transactions = block.transactions;
        const receipts = block.transaction_receipts;
        // console.log(SWAP_SELECTOR); // 0xe316f0d9d2a3affa97de1d99bb2aac0538e2666d0d8545545ead241ef0ccab
    
        for(const receipt of receipts) {
            for(const event of receipt.events) {
                const eventCalldata = await getEventCalldata(event);
                if(eventCalldata) {
                    console.log(`Event ${eventCalldata.name} triggered`);
                    // console.log(`Event: ${eventCalldata.name}`);
                    // for(const calldataValue of eventCalldata.calldata) {
                    //     console.log(calldataValue.name, " : ", calldataValue.value);
                    // }
                } else {
                    console.log("Unkown event tiggered");
                    // console.log(event);
                }
    
                // const tx = transactions[receipt.transaction_index] as InvokeFunctionTransaction;
                // try {
                //     const functionCalls = await getCalldataPerFunctionFromTx(tx);
                //     for(const functionCall of functionCalls) {
                //         console.log(`Called ${functionCall.name}`);
                //     }
                //     console.log("-----------------------");
                // } catch(error) {
                //     console.log(`Error with in block ${block.block_hash} with transaction hash ${receipt.transaction_hash}`);
                //     console.log(error);
                //     // console.log("Error with transaction: ", tx);
                // }
                await sleep(500);
            }
        }
    }

    console.log("done");
}

analyzeBlock(140046, 141000);