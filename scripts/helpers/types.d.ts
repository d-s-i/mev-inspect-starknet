import { BigNumber } from "ethers";
import { FunctionAbi, StructAbi, AbiEntry, EventAbi } from "starknet/types/index";

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

// export interface StarknetContractCode {
//     functions: FunctionAbi[],
//     structs: StructAbi[],
//     events: EventAbi[]
// }

export interface StarknetContractCode {
    functions: OrganizedFunctionAbi,
    structs: OrganizedStructAbi,
    events: OrganizedEventAbi
}

export interface OrganizedFunctionAbi { 
    [selector: string]: FunctionAbi 
}

export interface OrganizedStructAbi {
    [key: string]: StarknetStruct
}

export interface OrganizedEventAbi { 
    [key: string]: EventAbi
}

export interface StarknetStruct { 
    size: number,
    properties: (AbiEntry & { offset: number; })[] | []
}

export type StarknetArgument = { [key: string]: any } | BigNumber;

export interface CallArray {
    to: BigNumber,
    selector: BigNumber,
    dataOffset: BigNumber,
    dataLen: BigNumber
}

export interface FunctionCall {
    name: string;
    to: BigNumber;
    calldata: any;
}

export type OrganizedCalldata = StarknetArgument | StarknetArgument[];