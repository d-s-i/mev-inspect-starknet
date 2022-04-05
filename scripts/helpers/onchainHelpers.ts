import { defaultProvider } from "starknet";
import { STARKNET_BLOCKS_PER_DAY } from "./constants";
import { sleep, displayProgress } from "./helpers";
import { RangeMilestones } from "./types";
import { Event, InvokeFunctionTransaction } from "starknet/dist/types/api";
import { 
    getContractAbi,
    getArgumentsValuesFromCalldata,
    destructureFunctionCalldata,
    getCalldataPerFunction
} from "./contractsHelpers";

export const getEventCalldata = async function(event: Event) {
    const contractCode = await getContractAbi(event.from_address);

    let dataIndex = 0;
    if(contractCode.events.eventAbi?.data) {
        let eventArgs = [];
        for(const arg of contractCode.events.eventAbi.data) {
            const { argsValues, endIndex } = getArgumentsValuesFromCalldata(
                arg.type, 
                { fullCalldataValues: event.data, startIndex: dataIndex }, 
                contractCode.structs
            );
            dataIndex = endIndex;
            eventArgs.push({ ...arg, value: argsValues });
        }
        return { name: contractCode.events.eventAbi.name, calldata: eventArgs };
    } 
}

export const getCalldataPerFunctionFromTx = async function(transaction: InvokeFunctionTransaction) {
    const { callArray, rawFnCalldata } = destructureFunctionCalldata(transaction);
    const functionCalls = await getCalldataPerFunction(callArray, rawFnCalldata);

    return functionCalls;
}

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