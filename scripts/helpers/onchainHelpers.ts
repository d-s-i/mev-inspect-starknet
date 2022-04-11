import { defaultProvider } from "starknet";
import { STARKNET_BLOCKS_PER_DAY } from "./constants";
import { sleep, displayProgress } from "./helpers";
import { 
    RangeMilestones, 
} from "./types";

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
const getMilestones = function(start: number, end: number) {
    const length = end - start;
    let indexes = [];
    for(let i = 0; i <= length; i++) {
        indexes.push(start + i);
    }

    const milestones = {
        milestoneOne: indexes[Math.trunc(length / 4)],
        milestoneTwo: indexes[Math.trunc(length / 2)],
        milestoneThree: indexes[Math.trunc(3 * length / 4)],
        milestoneFour: indexes[length]
    };

    return milestones;
}