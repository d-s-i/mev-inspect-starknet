import { defaultProvider } from "starknet";
import { 
    InvokeFunctionTransaction, 
} from "starknet/types/index";
import {
    getCalldataPerCallFromTx,
    getCalldataPerEventFromTx
} from "./helpers/onchainHelpers";
import { sleep } from "./helpers/helpers";

const FILE_PATH = "scripts/analyzeBlock";

const analyzeBlock = async function(blockNumber: number) {
    const block = await defaultProvider.getBlock(blockNumber);
    const transactions = block.transactions;
    const receipts = block.transaction_receipts;

    for(const receipt of receipts) {
        for(const event of receipt.events) {
            const eventCalldata = await getCalldataPerEventFromTx(event);
            if(eventCalldata) {
                console.log(`Event: ${eventCalldata.name}`);
                for(const calldataValue of eventCalldata.calldata) {
                    console.log(calldataValue.name, " : ", calldataValue.value);
                }
            }

            const tx = transactions[receipt.transaction_index] as InvokeFunctionTransaction;
            try {
                console.log(tx.calldata);
                const functionCalls = await getCalldataPerCallFromTx(tx);
                for(const functionCall of functionCalls) {
                    console.log(`Called ${functionCall.name}`);
                }
                console.log("-----------------------");
            } catch(error) {
                console.log(`Error with in block ${block.block_hash} with transaction hash ${receipt.transaction_hash}`);
                console.log(error);
                // console.log("Error with transaction: ", tx);
            }
            await sleep(1000);
        }
    }

    console.log("done");
}

analyzeBlock(140046);