import { starknet } from "hardhat";
import path from "path";
import fs from "fs-extra";
import { defaultProvider, Provider } from "starknet";

import { 
    sortAddressesPerActivity,
    writeInFile
} from "./helpers/helpers";
import { 
    getAllTransactionsWithingBlockRange, 
    getBlockRange,
    getContractInteractions 
} from "./helpers/onchainHelpers";
import { ContractInfos } from "./helpers/types";


// Waiting for nodes to activate APIs before using local nodes
// const NODE_BASE_URL = "http://0.0.0.0:9545";
// const provider = new Provider({ baseUrl : NODE_BASE_URL });

const main = async function() {

    const { startBlockNumber, latestBlockNumber, milestones } = await getBlockRange();
    
    const allTransactions = await getAllTransactionsWithingBlockRange({
        startBlockNumber, 
        endBlockNumber: latestBlockNumber, 
        milestones
    });

    const contractsInteractions = await getContractInteractions(allTransactions);

    const sortedContractInteractions = sortAddressesPerActivity(contractsInteractions);

    writeInFile(["..", "data", "activeAccounts.json"], sortedContractInteractions);

    console.log("Done.");
    
}

main();