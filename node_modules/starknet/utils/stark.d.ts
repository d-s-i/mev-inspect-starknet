import BN from 'bn.js';

import { Calldata, CompressedProgram, Program, RawArgs, Signature } from '../types';
import { BigNumberish } from './number';
/**
 * Function to compress compiled cairo program
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/services/api/gateway/transaction.py#L54-L58)
 * @param jsonProgram - json file representing the compiled cairo program
 * @returns Compressed cairo program
 */
export declare function compressProgram(jsonProgram: Program | string): CompressedProgram;
export declare function randomAddress(): string;
export declare function makeAddress(input: string): string;
export declare function formatSignature(sig?: Signature): string[];
export declare function compileCalldata(args: RawArgs): Calldata;
export declare function estimatedFeeToMaxFee(estimatedFee: BigNumberish, overhead?: number): BN;
