import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
// import { starknet } from "hardhat";
import { defaultProvider } from "starknet";
import { FunctionAbi, StructAbi, InvokeFunctionTransaction, AbiEntry } from "starknet/types/index";
import { decodeShortString } from "starknet/utils/shortString";
import { 
    TRANSFER_SELECTOR, 
    APPROVAL_SELECTOR,
    SWAP_SELECTOR,
} from "./helpers/constants";
import {
    destructureCalldata,
    getDecimalsOfToken,
    getSymbolOfToken,
    getSymbolAndDecimalsOfToken,
    getFunctionABIFromSelector,
    getContract,
    getFunctionCalldata
} from "./helpers/contractsHelpers";
import { StarknetContractCode } from "./helpers/types";
import { sleep } from "./helpers/helpers";

const FILE_PATH = "scripts/analyzeBlock"

const analyzeBlock = async function(blockNumber: number) {
    const block = await defaultProvider.getBlock(blockNumber);
    const transactions = block.transactions;
    const receipts = block.transaction_receipts;

    for(const receipt of receipts) {
        for(const events of receipt.events) {
            if(events.keys[0] === TRANSFER_SELECTOR) {
                const from = events.data[0];
                const to = events.data[1];
                const amount = BigNumber.from(events.data[2]).add(events.data[3]);

                // const code = await defaultProvider.getCode(event.from_address);
                // const { symbol, decimals } = await getSymbolAndDecimalsOfToken(events.from_address);

                // console.log(`\n${formatUnits(amount, decimals)} ${decodeShortString(symbol)} transfered from ${from} to ${to}`);
            } else if(events.keys[0] === SWAP_SELECTOR) {
                const from = events.data[0];
                const amount0In = BigNumber.from(events.data[1]).add(events.data[2]);
                const amount1In = BigNumber.from(events.data[3]).add(events.data[4]);
                const amount0Out = BigNumber.from(events.data[5]).add(events.data[6]);
                const amount1Out = BigNumber.from(events.data[7]).add(events.data[8]);
                const destination = events.data[9];

                const amountIn = amount0In.isZero() ? amount1In : amount0In;                
                const amountOut = amount0Out.isZero() ? amount1Out : amount0Out;                

                // console.log(`${from} swapped ${formatUnits(amountIn)} for ${formatUnits(amountOut)} to ${destination}`);
                const tx = transactions[receipt.transaction_index] as InvokeFunctionTransaction;
                
                const { callArray, rawFnCalldata } = destructureCalldata(tx);

                let rawCallDataIndex = 0;
                let calldata = [];
                for(const call of callArray!) {
                    const contractCode = await getContract(call.to.toHexString());
                    const fnAbi = await getFunctionABIFromSelector(contractCode.functions, call.selector.toHexString());
                    const { subcalldata, endIndex } = getFunctionCalldata(contractCode, { abi: fnAbi, rawFnCalldata, startIndex: rawCallDataIndex });
                    rawCallDataIndex = endIndex;
                    calldata.push({
                        functionName: fnAbi.name,
                        calldata: subcalldata
                    });
                }
                // console.log(calldata);
                for(const call of calldata) {
                    console.log(call.calldata);
                }
            } else {
                // console .log("------------------------------");
            }
        }
    }

    console.log("done");
}

analyzeBlock(144825);