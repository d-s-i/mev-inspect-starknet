import { BigNumber } from "ethers";
import {
    InvokeFunctionTransaction
} from "starknet";

import { callArrayStructLength } from "../helpers/constants";

export class TransactionAnalyzer {
    
    /**
     * @dev - Transactions have:
     * 1) An array of contracts to call
     * 2) The arguments of each contract call
     * @returns an organized object of a transaction calldata
     */
    static destructureFunctionCalldata(tx: InvokeFunctionTransaction) {
        if(!tx.calldata) {
            console.log(tx);
            throw new Error(`TransactionAnalyzer::destructureFunctionCalldata - Calldata of tx is undefined (calldata: ${tx.calldata})`);
        };

        const callArray = this._getCallArrayFromTx(tx);

        const offset = (callArray.length * callArrayStructLength) + 1;
        const rawFnCalldata = this._getRawFunctionCalldataFromTx(tx, offset);

        const nonce = tx.calldata[tx.calldata.length - 1];

        return { callArray, rawFnCalldata, nonce };
    }

    static _getCallArrayFromTx(tx: InvokeFunctionTransaction) {
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

    static _getRawFunctionCalldataFromTx(tx: InvokeFunctionTransaction, offset: number) {
        const calldataLength = BigNumber.from(tx.calldata![offset]).toNumber();
        let fnCalldata = [];
        for(let j = offset + 1; j <= calldataLength + offset; j++) {
            fnCalldata.push(BigNumber.from(tx.calldata![j]));
        }

        return fnCalldata;
    }
}