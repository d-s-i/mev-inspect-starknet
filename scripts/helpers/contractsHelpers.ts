import { DeployTransaction } from "starknet";
import {  InvokeFunctionTransaction } from "starknet/types";

import { EXECUTE_SELECTOR } from "./constants";
import { 
    ContractInfos 
} from "./types";


export const getContractInteractions = async function(transactions: (DeployTransaction | InvokeFunctionTransaction)[]) {
    let contractsInteractions: ContractInfos = {};
    for(const tx of transactions) {
        if(tx.type === "DEPLOY") continue;
        
        const type = getContractType(tx);
        
        let amount = contractsInteractions[tx.contract_address] && contractsInteractions[tx.contract_address].transactionCount;
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
    return transaction.entry_point_selector === EXECUTE_SELECTOR ? "ACCOUNT_CONTRACT" : "GENERAL_CONTRACT";
}