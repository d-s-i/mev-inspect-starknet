import { BigNumber } from "ethers";
import { FunctionAbi, StructAbi, AbiEntry } from "starknet/types/index";

export interface ContractInfos {
     [key: string]: { 
         transactionCount: number, 
         type: string 
        } 
}

export interface RangeMilestones {
    milestoneOne: number, 
    milestoneTwo: number, 
    milestoneThree: number, 
    milestoneFour: number 
}

export interface AccountCallArray {
    to: BigNumber,
    selector: BigNumber,
    dataOffset: BigNumber,
    dataLen: BigNumber
}

export interface StarknetContractCode {
    functions: FunctionAbi[],
    structs: StructAbi[]
}

export interface StarknetStructAbi {
    [key: string]: { 
        size: number, 
        properties: (AbiEntry & { offset: number })[] | undefined 
    } 
}

export type StarknetArgument = { [key: string]: any } | BigNumber;