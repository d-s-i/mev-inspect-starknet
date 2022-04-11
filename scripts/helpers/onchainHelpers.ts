import { defaultProvider } from "starknet";
import { STARKNET_BLOCKS_PER_DAY } from "./constants";
import { BigNumber } from "ethers";
import { sleep, displayProgress } from "./helpers";
import { 
    RangeMilestones, 
    FunctionCall, 
    OrganizedStructAbi,
    OrganizedCalldata
} from "./types";
import { Event } from "starknet/dist/types/api";
import { FunctionAbi, InvokeFunctionTransaction } from "starknet/types"
import { 
    getContractAbi,
    destructureFunctionCalldata,
    getCalldataPerCall
} from "./contractsHelpers";
import { ContractAnalyzer } from "../contractAnalyzer";

const FILE_PATH = "scripts/onchainHelpers";

export const getCalldataPerCallFromTx = async function(transaction: InvokeFunctionTransaction) {
    const { callArray, rawFnCalldata } = destructureFunctionCalldata(transaction);
    const functionCalls = await getCalldataPerCall(callArray, rawFnCalldata);

    return functionCalls as FunctionCall[];
}

export const getCalldataPerEventFromTx = async function(event: Event) {
    const { structs, functions, events } = await getContractAbi(event.from_address);
    const contractAnalyzer = new ContractAnalyzer(
        event.from_address,
        structs,
        functions,
        events
    );
    try {
        const structuredEvent = await contractAnalyzer.structureEvent(event);
        return structuredEvent;
    } catch(error) {
        return undefined;
    }
}

//////////////////

export const getBlockRange = async function() {
    const latestBlockNumber = await getLatestBlockNumber();
    const startBlockNumber = latestBlockNumber - STARKNET_BLOCKS_PER_DAY;

    console.log(`\nStarting at ${startBlockNumber} and ending at ${latestBlockNumber} (${STARKNET_BLOCKS_PER_DAY} blocks total)`);

    const milestones = getMilestones(startBlockNumber, latestBlockNumber);

    return { latestBlockNumber, startBlockNumber, milestones };
    
}

export const getAllTransactionsWithingBlockRange = async function(
    { startBlockNumber, endBlockNumber, milestones }: { startBlockNumber: number, endBlockNumber: number, milestones: RangeMilestones }
) {
    
    let allTransactions = [];
    // TODO: Add fee per transaction => sort address per fee spent
    for(let i = startBlockNumber; i <= endBlockNumber; i++) {
        displayProgress(
            milestones,
            i,
            "fetching blocks"
        );

        const block = await defaultProvider.getBlock(i);
        allTransactions.push(...block.transactions);
        await sleep(500);
    }

    return allTransactions;
}

export const getLatestBlockNumber = async function() {
    const latestBlock = await defaultProvider.getBlock("pending");
    if(!latestBlock.block_number && latestBlock.parent_block_hash) {
        const previousLatestBlock = await defaultProvider.getBlock(latestBlock.parent_block_hash);
        return previousLatestBlock.block_number;
    } else {
        return latestBlock.block_number;
    }
}

/**
    @dev Function to retreive milestones from a range. Used to display progress of a long indexed action.
*/
const getMilestones = function(startBlockNumber: number, endBlockNumber: number) {
    const length = endBlockNumber - startBlockNumber;
    let indexes = [];
    for(let i = 0; i <= length; i++) {
        indexes.push(startBlockNumber + i);
    }

    const milestones = {
        milestoneOne: indexes[Math.trunc(length / 4)],
        milestoneTwo: indexes[Math.trunc(length / 2)],
        milestoneThree: indexes[Math.trunc(3 * length / 4)],
        milestoneFour: indexes[length]
    };

    return milestones;
}