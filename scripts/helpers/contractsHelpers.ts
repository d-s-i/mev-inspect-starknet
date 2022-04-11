import { defaultProvider, DeployTransaction } from "starknet";
import { getSelectorFromName } from "starknet/utils/hash";
import { FunctionAbi, InvokeFunctionTransaction } from "starknet/types";
import { BigNumber } from "ethers";
import { sleep } from "./helpers";
import { EXECUTE_SELECTOR, callArrayStructLength } from "./constants";
import { 
    ContractInfos, 
    StarknetContractCode, 
    OrganizedEventAbi,
    OrganizedStructAbi,
    OrganizedFunctionAbi,
    CallArray
} from "./types";
import { ContractAnalyzer } from "../contractAnalyzer";

const FILE_PATH = "scripts/helpers/contractsHelpers";

export const getCalldataPerCall = async function(
    callArray: CallArray[],
    fullTxCalldata: BigNumber[]
) {
    let rawCalldataIndex = 0;
    let functionCalls = [];
    let contractAnalyzers: { [key: string]: ContractAnalyzer } = {};
    for(const call of callArray) {
        const { contractAnalyzer, newContractAnalyzer } = await getContractAnalyzer(call.to.toHexString(), contractAnalyzers);
        contractAnalyzers = newContractAnalyzer; 

        const { subcalldata, endIndex } = contractAnalyzer.structureFunctionInput(
            call.selector.toHexString(), 
            { fullCalldataValues: fullTxCalldata, startIndex: rawCalldataIndex }, 
        );
        if(!endIndex && endIndex !== 0) {
            throw new Error(`${FILE_PATH}/analyzeBlock - No endIndex returned (endIndex: ${endIndex})`);
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

const getContractAnalyzer = async function(
    address: string, 
    contractAnalyzers: { [key: string]: ContractAnalyzer }
) {

    // store contract to avoid fetching the same contract twice for the same function call
    if(!contractAnalyzers[address]) {
        const { functions, structs, events } = await getContractAbi(address);
        let newContractAnalyzer = contractAnalyzers;
        newContractAnalyzer[address] = new ContractAnalyzer(address, structs, functions, events);
        return { contractAnalyzer: newContractAnalyzer[address], newContractAnalyzer };
    } else {
        return { contractAnalyzer: contractAnalyzers[address], newContractAnalyzer: contractAnalyzers };
    }

}

/**
 * 
 * @dev - Transactions have:
 * 1) An array of contracts to call
 * 2) The arguments of each contract call
 * @returns an organized object of a transaction calldata
 */
export const destructureFunctionCalldata = function(tx: InvokeFunctionTransaction) {
    if(!tx.calldata) {
        console.log(tx);
        throw new Error(`${FILE_PATH}/destructureFunctionCalldata - Calldata of tx is undefined (calldata: ${tx.calldata})`);
    };

    const callArray = getCallArrayFromTx(tx);

    const offset = (callArray.length * callArrayStructLength) + 1;
    const rawFnCalldata = getRawFunctionCalldataFromTx(tx, offset);

    const nonce = tx.calldata[tx.calldata.length - 1];

    return { callArray, rawFnCalldata, nonce };
}

const getCallArrayFromTx = function(tx: InvokeFunctionTransaction) {
    const callArrayLength = BigNumber.from(tx.calldata![0]).toNumber();
    let callArray = [];
    // offset i by 1 so that is start at the `call_array` first value, and not at `call_array_len`
    // see the `__execute__` function's args at https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/openzeppelin/account/Account.cairo
    for(let i = 1; i < callArrayLength * callArrayStructLength; i = i + callArrayStructLength) {
        callArray.push({
            to: BigNumber.from(tx.calldata![i]),
            selector: BigNumber.from(tx.calldata![i + 1]),
            dataOffset: BigNumber.from(tx.calldata![i + 2]),
            dataLen: BigNumber.from(tx.calldata![i + 3]),
        });
    }

    return callArray;
}

const getRawFunctionCalldataFromTx = function(tx: InvokeFunctionTransaction, offset: number) {
    const calldataLength = BigNumber.from(tx.calldata![offset]).toNumber();
    let fnCalldata = [];
    for(let j = offset + 1; j <= calldataLength + offset; j++) {
        fnCalldata.push(BigNumber.from(tx.calldata![j]));
    }

    return fnCalldata;
}

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

export const callContract = async function(address: string, entrypoint: string) {
    const { result } = await defaultProvider.callContract({
        contractAddress: address,
        entrypoint: entrypoint,
    });

    return result;
}

export const getDecimalsOfToken = async function(tokenAddress: string) {
    let decimals;
    try {
        const { result } = await defaultProvider.callContract({
            contractAddress: tokenAddress,
            entrypoint: "decimals"
        });
        decimals = result[0];
    } catch(error) {
        decimals = 0;
    }

    return decimals;
}

export const getSymbolOfToken = async function(tokenAddress: string) {
    const { result: [symbol] } = await defaultProvider.callContract({
        contractAddress: tokenAddress,
        entrypoint: "symbol",
    });

    return symbol;
}

export const getSymbolAndDecimalsOfToken = async function(tokenAddress: string) {
    const symbol = await getSymbolOfToken(tokenAddress);
    await sleep(500);
    const decimals = await getDecimalsOfToken(tokenAddress);

    return { symbol, decimals };
}

export const getContractAbi = async function(contractAddress: string) {
    const { abi } = await defaultProvider.getCode(contractAddress);

    let functions: OrganizedFunctionAbi = {};
    let events: OrganizedEventAbi = {};
    let structs: OrganizedStructAbi = {};
    for(const item of abi) {
        if(item.type === "function") {
            const _name = BigNumber.from(getSelectorFromName(item.name)).toHexString()
            functions[_name] = item;
        }
        if(item.type === "struct") {
            structs[item.name] = {
                size: item.size,
                properties: item.members || []
            };
        }
        if(item.type === "event") {
            const _name = BigNumber.from(getSelectorFromName(item.name)).toHexString()
            events[_name] = item;
        }
    }
    return { functions, structs, events } as StarknetContractCode;
}

const getFunctionAbiFromContractCode = function(contractCode: StarknetContractCode, call: CallArray) {
    const fnAbi = contractCode.functions[call.selector.toHexString()];
    if(!fnAbi) {
        // console.log("\nContract Abi only has those functions: ");
        // Object.entries(contractCode.functions).map(([key, value]) => {
        //     console.log(`selector:  ${key} - name: ${value.name}`);
        // })
        throw new Error(
            `${FILE_PATH}/getFunctionAbiFromContractCode - No Abi found for function ${call.selector.toHexString()} at contract address ${call.to.toHexString()}`
        );
    }
    return fnAbi;
}