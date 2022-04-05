import { defaultProvider, DeployTransaction } from "starknet";
import { getSelectorFromName } from "starknet/utils/hash";
import { FunctionAbi, InvokeFunctionTransaction, AbiEntry } from "starknet/types";
import { 
    EventAbi,
} from "starknet/types/index";
import { Event } from "starknet/dist/types/api";
import { BigNumber } from "ethers";
import { sleep } from "./helpers";
import { EXECUTE_SELECTOR, callArrayStructLength } from "./constants";
import { 
    ContractInfos, 
    AccountCallArray, 
    StarknetContractCode, 
    StarknetStructAbi,
    StarknetArgument,
    StarknetStruct,
    CallArray
} from "./types";

const FILE_PATH = "scripts/helpers/contractsHelpers";

export const getCalldataPerFunction = async function(
    callArray: CallArray[],
    fullTxCalldata: BigNumber[]
) {
    let rawCalldataIndex = 0;
    let functionCalls = [];
    for(const call of callArray) {
        const contractCode = await getContract(call.to.toHexString());
        const fnAbi = getFunctionABIFromSelector(contractCode.functions, call.selector.toHexString());
        const { subcalldata, endIndex } = getSingleFunctionCalldata(
            contractCode, 
            { calldata: fullTxCalldata, startIndex: rawCalldataIndex }, 
            fnAbi
        );
        if(!endIndex) {
            throw new Error(`${FILE_PATH}/analyzeBlock - No endIndex returned (endIndex: ${endIndex})`);
        }
        rawCalldataIndex = endIndex;
        functionCalls.push({
            name: fnAbi.name,
            calldata: subcalldata
        });
    }
    return functionCalls;
}

/**
 * 
 * @param contractCode - Code of the target contract fetched from `get_code` 
 * @param calldataObj - Calldata of the whole transaction (needs a start index to know how divide it in case it's a multi call) 
 * @param calledFunctionAbi - Abi of the function to know how to divide each args into each inputs
 * @returns calldata of the function called and endIndex where the function call end in the whole calldata of the transaction
 */
const getSingleFunctionCalldata = function(
    contractCode: StarknetContractCode, 
    calldataObj: { calldata: BigNumber[], startIndex: number },
    calledFunctionAbi: FunctionAbi
) {

    const inputs = calledFunctionAbi.inputs;
    let calldataIndex = calldataObj.startIndex;

    const structs = getStructsFromContractAbi(contractCode);

    let calldata: any = [];
    for(const input of inputs) {
        
        const { argsValues, endIndex } = getArgumentsValuesFromCalldata(
            input.type,
            calldataObj.calldata,
            calldataIndex,
            structs
        );
        calldataIndex = endIndex;
        calldata.push({ ...input, value: argsValues });
    }

    return { subcalldata: calldata, endIndex: calldataIndex };
}

/**
 * 
 * @param type - Type of the starknet argument (4 possible: felt, felt*, my_struct, my_struct*)
 * @param calldata - Calldata of the whole starknet function call
 * @param startIndex - Index from the full calldata of the starknet function call where you start fetching the arguments
 * @param structs - Structs of the contract to build the argument in case it is a struct
 * @returns - The subcalldata of the function call and the index where it stopped (so that the next  function call cal start at the right place)
 */
export const getArgumentsValuesFromCalldata = function(
    type: string,
    calldata: BigNumber[],
    startIndex: number,
    structs: StarknetStructAbi
) {
    const rawType = type.includes("*") ? type.slice(0, type.length - 1) : type;
    if(type === "felt") {
        const { felt, endIndex } = getFeltFromCalldata(calldata, startIndex);
        return { argsValues: felt, endIndex };
    } else if(type === "felt*") {
        const size = calldata[startIndex - 1].toNumber();
        const { feltArray, endIndex } = getFeltArrayFromCalldata(calldata, startIndex, size);
        return { argsValues: feltArray, endIndex };
    } else if(!type.includes("*") && type !== "felt") {
        const { structCalldata, endIndex } = getStructFromCalldata(structs[rawType], calldata, startIndex);
        return { argsValues: structCalldata, endIndex };
    } else {
        const size = calldata[startIndex - 1].toNumber();
        const { structArray, endIndex } = getStructArrayFromCalldata(
            structs[rawType], 
            calldata,
            startIndex,
            size
        );
        return { argsValues: structArray, endIndex };
    }
}

const getFeltFromCalldata = function(
    calldata: BigNumber[],
    startIndex: number
) {
    const felt = calldata[startIndex];
    startIndex++;
    return { felt, endIndex: startIndex };
}

const getFeltArrayFromCalldata = function(
    calldata: BigNumber[],
    startIndex: number,
    sizeOfArray: number
) {
    let feltArray = [];
    let calldataIndex = startIndex;
    for(let j = startIndex; j < startIndex + sizeOfArray; j++) {
        feltArray.push(calldata[j]);
        calldataIndex++;
    }

    return { feltArray, endIndex: calldataIndex };
}

// TODO: What if a nested property is a struct itself ? 
const getStructFromCalldata = function(
    struct: StarknetStruct,
    calldata: BigNumber[],
    startIndex: number
) {
    if(!struct.properties) {
        throw new Error(`${FILE_PATH}/getFunctionCalldata - No properties for struct of type ${struct} in the fetched contract abi`);
    }
    let structCalldata: StarknetArgument = {};
    let calldataIndex = startIndex;
    for(const property of struct.properties) {
        structCalldata[property.name] = calldata[calldataIndex];
        calldataIndex++;
    }

    return { structCalldata, endIndex: calldataIndex };
}

const getStructArrayFromCalldata = function(
    struct: StarknetStruct,
    calldata: BigNumber[],
    startIndex: number,
    size: number,

) {
    let structArray = [];
    let calldataIndex = startIndex;
    for(let j = 0; j < size; j++) {
        let singleStruct: StarknetArgument = {};
        if(!struct.properties) {
            throw new Error(`${FILE_PATH}/getFunctionCalldata - No properties for struct of type ${struct} in the fetched contract abi`);
        }
        for(const property of struct.properties!) {
            singleStruct[property.name] = calldata[calldataIndex];
            calldataIndex++;
        }
        structArray.push(singleStruct);
    }

    return { structArray, endIndex: calldataIndex };
}

export const getStructsFromContractAbi = function(contractCode: StarknetContractCode) {
    let structs: StarknetStructAbi = { 
        "felt": {
            size: 1,
            properties: []
        } 
    };

    for(const struct of contractCode.structs) {
        structs[struct.name] = {
            size: struct.size,
            properties: struct.members || []
        };
    }
    return structs;
}

/**
 * 
 * @dev - Transactions have:
 * 1) An array of contracts to call
 * 2) The arguments of each contract call
 * @returns an organized object of a transaction calldata
 */
export const destructureCalldata = function(tx: InvokeFunctionTransaction) {
    if(!tx.calldata) {
        console.log(tx);
        throw new Error(`${FILE_PATH}/destructureCalldata - Calldata of tx is undefined (calldata: ${tx.calldata})`);
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
    let events = [];
    let structs = [];
    for(const item of abi) {
        if(item.type === "function") functions.push(item);
        if(item.type === "struct") structs.push(item);
        if(item.type === "event") events.push(item);
    }
    return { functions, structs, events } as StarknetContractCode;
}

export const getEventAbiFromContractCode = function(event: Event, eventsAbi: EventAbi[]) {
    
    for(const eventAbi of eventsAbi) {
        const eventSelector = BigNumber.from(getSelectorFromName(eventAbi.name));
        if(eventSelector.eq(event.keys[0])) {
            return eventAbi;
        }
    }
}

export const getFunctionABIFromSelector = function(functions: FunctionAbi[], selector: string) {
    for(const fn of functions) {
        if(BigNumber.from(getSelectorFromName(fn.name)).eq(selector)) return fn;
    }

    throw new Error(`${FILE_PATH}/findNamefromSelector - selector not found in abi`);
}