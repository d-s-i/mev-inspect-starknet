import { defaultProvider, DeployTransaction, InvokeFunctionTransaction } from "starknet";
import { STARKNET_BLOCKS_PER_DAY, EXECUTE_SELECTOR } from "./constants";
import { sleep, displayProgress } from "./helpers";
import { RangeMilestones, ContractInfos } from "./types";

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
        console.log("------------ TRANSACTIONS --------------");
        console.log(block.transactions[0]);
        console.log("-----------TRANSACTIONS_RECEIPTS---------------");
        console.log(block.transaction_receipts[0]);
        await sleep(500);
    }

    return allTransactions;
}

export const getContractInteractions = async function(transactions: (DeployTransaction | InvokeFunctionTransaction)[]) {
    let contractsInteractions: ContractInfos = {};
    for(const tx of transactions) {
        if(tx.type === "DEPLOY") continue;
        
        const type = getContractType(tx);
        
        let amount = contractsInteractions[tx.contract_address] && contractsInteractions[tx.contract_address].transactionCount;
        // let feeSpent = contractsInteractions[tx.contract_address] && contractsInteractions
        contractsInteractions[tx.contract_address] = {
            transactionCount: isNaN(amount) ? 1 : amount + 1,
            type: type
        };
    }
    return contractsInteractions;
}

const getContractType = function(transaction: InvokeFunctionTransaction) {
        // assuming accounts contract calls `__execute__`
        // other solution : calling `get_signer` for Argent Accounts or `get_public_key` for OpenZeppelin Accounts, but it is very long
        return transaction.entry_point_selector === EXECUTE_SELECTOR ? "ACCOUNT_CONTRACT" : "GENRAL_CONTRACT";
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
    @dev Function to retreive milestones from a range. Used to display progress of a long action.
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