// import { starknet } from "hardhat";
import { defaultProvider } from "starknet";
import { 
    InvokeFunctionTransaction, 
} from "starknet/types/index";
import { 
    TRANSFER_SELECTOR, 
    APPROVAL_SELECTOR,
    SWAP_SELECTOR,
} from "./helpers/constants";
import {
    getCalldataPerFunctionFromTx,
    getEventCalldata
} from "./helpers/onchainHelpers";

const FILE_PATH = "scripts/analyzeBlock"

const analyzeBlock = async function(blockNumber: number) {
    const block = await defaultProvider.getBlock(blockNumber);
    const transactions = block.transactions;
    const receipts = block.transaction_receipts;

    for(const receipt of receipts) {
        for(const event of receipt.events) {
            const eventCalldata = await getEventCalldata(event);
            if(eventCalldata) {
                console.log(`Event: ${eventCalldata.name}`);
                for(const calldataValue of eventCalldata.calldata) {
                    console.log(calldataValue.name, " : ", calldataValue.value);
                }
            }

            const tx = transactions[receipt.transaction_index] as InvokeFunctionTransaction;
            try {
                const functionCalls = await getCalldataPerFunctionFromTx(tx);
                for(const functionCall of functionCalls) {
                    console.log(`Called ${functionCall.name}`);
                }
                console.log("-----------------------");
            } catch(error) {
                console.log(`Error with in block ${block.block_hash} with transaction hash ${receipt.transaction_hash}`);
                console.log(error);
                // console.log("Error with transaction: ", tx);
            }
        }
    }

    console.log("done");
}

analyzeBlock(140040);