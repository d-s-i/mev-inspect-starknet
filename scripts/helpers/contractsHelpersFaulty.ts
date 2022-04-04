import { defaultProvider, DeployTransaction } from "starknet";
import { getSelectorFromName } from "starknet/utils/hash";
import { FunctionAbi, InvokeFunctionTransaction, AbiEntry } from "starknet/types";
import { BigNumber } from "ethers";
import { sleep } from "./helpers";
import { EXECUTE_SELECTOR, callArrayStructLength } from "./constants";
import { 
    ContractInfos, 
    AccountCallArray, 
    StarknetContractCode,
    StarknetStructAbi,
    StarknetArgument
} from "./types";

const FILE_PATH = "scripts/helpers/contractsHelpers";

export const getFunctionCalldata = function(
    contractCode: StarknetContractCode, 
    calledFunction: {
        abi: FunctionAbi,
        rawFnCalldata: BigNumber[],
        startIndex: number
    }
) {

    const inputs = calledFunction.abi.inputs;
    let calldataIndex = calledFunction.startIndex;

    const structs = getStructsFromContractAbi(contractCode);

    let calldata: any = [];
    inputs.forEach((input, i) => {
        const type = input.type;
        const rawType = type.includes("*") ? type.slice(0, type.length - 1) : type;
        let value: StarknetArgument;
        if(type === "felt") {
            value = calledFunction.rawFnCalldata[calldataIndex];
            calldataIndex++;
        } else if(type === "felt*") {
            // case when argument is an array of felt
            const size = calledFunction.rawFnCalldata[calldataIndex - 1].toNumber();
            value = getFeltArrayFromCalldata(calledFunction.rawFnCalldata, size, calldataIndex);
        } else if(!type.includes("*") && type !== "felt") {
            // case where argument is a struct
            value = getStructFromCalldata(structs, rawType, calledFunction.rawFnCalldata, calldataIndex);
        } else {
            //case where it's an array of stuct
            const size = calledFunction.rawFnCalldata[calldataIndex - 1].toNumber();
            value = [];
            for(let j = calldataIndex; j < i + size; j++) {
                value = {};
                if(!structs[rawType].properties) throw new Error(`${FILE_PATH}/getFunctionCalldata - No properties for struct of type ${rawType} in the fetched contract abi`);
                for(const struct of structs[rawType].properties!) {
                    value[struct.name] = calledFunction.rawFnCalldata[i];
                    calldataIndex++;
                }
            }
        }
        calldata.push({ ...input, value: value });
    });

    return { subcalldata: calldata, endIndex: calldataIndex };

}

const getStructsFromContractAbi = function(contractCode: StarknetContractCode) {
    let structs: StarknetStructAbi = { 
        "felt": {
            size: 1,
            properties: undefined
        } 
    };

    for(const struct of contractCode.structs) {
        structs[struct.name] = {
            size: struct.size,
            properties: struct.members
        };
    }
    return structs;
}

const getFeltArrayFromCalldata = function(calldata: BigNumber [], size: number, startIndex: number) {
    let feltArray = [];
    let start = startIndex;
    for(let j = startIndex; j < start + size; j++) {
        feltArray.push(calldata[j]);
        startIndex++;
    }
    return feltArray;
}

const getStructFromCalldata = function(
    structs: StarknetStructAbi,
    structType: string,
    calldata: BigNumber[],
    startIndex: number
) {
    let value: { [key: string]: BigNumber } = {};
    if(!structs[structType].properties) throw new Error(`${FILE_PATH}/getFunctionCalldata - No properties for struct of type ${structType} in the fetched contract abi`);
    for(const struct of structs[structType].properties!) {
        value[struct.name] = calldata[startIndex];
        startIndex++;
    }
    return value;
}

export const destructureCalldata = function(tx: InvokeFunctionTransaction) {
    if(!tx.calldata) {
        console.log(tx);
        throw new Error(`${FILE_PATH}/destructureCalldata - Calldata of tx is undefined (calldata: ${tx.calldata})`);
    };

    const callArray = getCallArrayFromTx(tx);

    const offset = (callArray.length * callArrayStructLength) + 1;
    const rawFnCalldata = getFunctionCalldataFromTx(tx, offset);

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

const getFunctionCalldataFromTx = function(tx: InvokeFunctionTransaction, offset: number) {
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

export const getContract = async function(contractAddress: string) {
    const { abi } = await defaultProvider.getCode(contractAddress);
    let functions = [];
    let structs = [];
    for(const item of abi) {
        if(item.type === "function") functions.push(item);
        if(item.type === "struct") structs.push(item);
    }
    return { functions, structs };
}

export const getFunctionABIFromSelector = async function(functions: FunctionAbi[], selector: string) {
    for(const fn of functions) {
        if(BigNumber.from(getSelectorFromName(fn.name)).eq(selector)) return fn;
    }

    throw new Error(`${FILE_PATH}/findNamefromSelector - selector not found in abi`);

}

/*
const getStructsFromContractAbi = function(contractCode: StarknetContractCode) {
    // let inputTypes = [];
    // for(const input of inputs) {
    //     inputTypes.push(input.type);
    // }

    let structs: { [key: string]: { size: number, properties: (AbiEntry & { offset: number })[] | undefined } } = { 
        "felt": {
            size: 1,
            properties: undefined
        } 
    };
    // for(const type of inputTypes) {
    //     const rawType = type.includes("*") ? type.slice(0, type.length - 1) : type;
    //     if(!rawType.includes("felt")) {
    //         let inputLength;
    //         let properties;
    //         for(const struct of contractCode.structs) {
    //             if(struct.name == rawType) {
    //                 inputLength = struct.size;
    //                 properties = struct.members;
    //             }
    //         }
    //         if(!inputLength) {
    //             throw new Error(`${FILE_PATH}/getFunctionCalldata - ${type} not found in the struct of this contract`);
    //         }
            // structs[type] = {
            //     size: inputLength,
            //     properties: properties
            // };
    //     }
    // }

    for(const struct of contractCode.structs) {
        structs[struct.name] = {
            size: struct.size,
            properties: struct.members
        };
    }
    return structs;

}
*/