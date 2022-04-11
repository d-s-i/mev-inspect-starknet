import { BigNumber } from "ethers";
import { 
    OrganizedEventAbi, 
    OrganizedFunctionAbi, 
    OrganizedStructAbi,
    StarknetArgument,
    OrganizedCalldata
} from "./helpers/types";
import { Event } from "starknet/dist/types/api";

export class ContractAnalyzer {

    private _structs: OrganizedStructAbi | undefined;
    private _functions: OrganizedFunctionAbi | undefined;
    private _events: OrganizedEventAbi | undefined;
    private _address: string;

    constructor(
        contractAddress: string,
        structs?: OrganizedStructAbi, 
        functions?: OrganizedFunctionAbi, 
        events?: OrganizedEventAbi
    ) {
        this._address = contractAddress;
        this._structs = structs;
        this._functions = functions;
        this._events = events;
    }

    structureFunctionInput(
        functionSelector: string,
        calldataObj: { fullCalldataValues: BigNumber[], startIndex: number }
    ) {

        const inputs = this.getFunctionAbiFromSelector(functionSelector).inputs;
        let calldataIndex = calldataObj.startIndex;
    
        let calldata: OrganizedCalldata = [];
        for(const input of inputs) {
            const { argsValues, endIndex } = this.getArgumentsValuesFromCalldata(
                input.type,
                { fullCalldataValues: calldataObj.fullCalldataValues, startIndex: calldataIndex }
            );
            calldataIndex = endIndex;
            calldata.push({ ...input, value: argsValues });
        }
    
        return { subcalldata: calldata, endIndex: calldataIndex };
    }

    structureFunctionOutput(
        functionSelector: string,
        calldataObj: { fullCalldataValues: BigNumber[], startIndex: number }
    ) {
        
        const outputs = this.getFunctionAbiFromSelector(functionSelector).outputs;
        let calldataIndex = calldataObj.startIndex;

        let calldata: OrganizedCalldata = [];
        for(const output of outputs) {
            const { argsValues, endIndex } = this.getArgumentsValuesFromCalldata(
                output.type,
                { fullCalldataValues: calldataObj.fullCalldataValues, startIndex: calldataIndex },
            );
            calldataIndex = endIndex;
            calldata.push({ ...output, value: argsValues });
        }

        return { subcalldata: calldata, endIndex: calldataIndex };
    }

    structureEvent(event: Event) {
        // TODO: make another for loop for each keys in case many events are triggered
        // (never saw this case yet after analysing hundreds of blocks)
        if(event.keys.length > 1) {
            throw new Error(`ContractAnalyzer::structureEvent - You forwarded an event with many keys. This is a reminder this need to be added.`);
        }

        const eventAbi = this.getEventAbiFromKey(event.keys[0]);
        
        let dataIndex = 0;
        let eventArgs = [];
        for(const arg of eventAbi.data) {
            const { argsValues, endIndex } = this.getArgumentsValuesFromCalldata(
                arg.type, 
                { fullCalldataValues: event.data, startIndex: dataIndex }, 
            );
            dataIndex = endIndex;
            eventArgs.push({ ...arg, value: argsValues });
        }
        return { name: eventAbi.name, transmitterContract: event.from_address, calldata: eventArgs };

    }

    getArgumentsValuesFromCalldata(
        type: string,
        calldata: { fullCalldataValues: BigNumber[], startIndex: number },
    ) {
        const rawType = type.includes("*") ? type.slice(0, type.length - 1) : type;
        if(type === "felt") {
            const { felt, endIndex } = this.getFeltFromCalldata(calldata.fullCalldataValues, calldata.startIndex);
            return { argsValues: felt, endIndex };
        } else if(type === "felt*") {
            const size = this.getArraySizeFromCalldata(calldata);
            const { feltArray, endIndex } = this.getFeltArrayFromCalldata(calldata.fullCalldataValues, calldata.startIndex, size);
            return { argsValues: feltArray, endIndex };
        } else if(!type.includes("*") && type !== "felt") {
            const { structCalldata, endIndex } = this.getStructFromCalldata(rawType, calldata.fullCalldataValues, calldata.startIndex);
            return { argsValues: structCalldata, endIndex };
        } else {
            const size = this.getArraySizeFromCalldata(calldata);
            const { structArray, endIndex } = this.getStructArrayFromCalldata(
                rawType, 
                calldata.fullCalldataValues,
                calldata.startIndex,
                size
            );
            return { argsValues: structArray, endIndex };
        }
    }

    getArraySizeFromCalldata(calldata: { fullCalldataValues: BigNumber[], startIndex: number }) {
        try {
            const size = calldata.fullCalldataValues[calldata.startIndex - 1].toNumber();
            return size;
        } catch(error) {
            console.log(error);
            throw new Error(
                `ContractAnalysze::getArraySizeFromCalldata - Error trying to get the previous calldata index and converting it into number (value: ${calldata.fullCalldataValues[calldata.startIndex - 1]})`
            );
        }
    }
    
    getFeltFromCalldata(
        calldata: BigNumber[],
        startIndex: number
    ) {
        const felt = calldata[startIndex];
        return { felt, endIndex: startIndex + 1 };
    }
    
    getFeltArrayFromCalldata(
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
    getStructFromCalldata(
        type: string,
        calldata: BigNumber[],
        startIndex: number
    ) {
        const structAbi = this.getStructAbiFromStructType(type);
        let structCalldata: StarknetArgument = {};
        let calldataIndex = startIndex;
        for(const property of structAbi.properties) {
            structCalldata[property.name] = calldata[calldataIndex];
            calldataIndex++;
        }
    
        return { structCalldata, endIndex: calldataIndex };
    }
    
    getStructArrayFromCalldata(
        type: string,
        calldata: BigNumber[],
        startIndex: number,
        size: number
    ) {
        const structAbi = this.getStructAbiFromStructType(type);
        let structArray = [];
        let calldataIndex = startIndex;
        for(let j = 0; j < size; j++) {
            let singleStruct: StarknetArgument = {};
 
            for(const property of structAbi.properties!) {
                singleStruct[property.name] = calldata[calldataIndex];
                calldataIndex++;
            }
            structArray.push(singleStruct);
        }
    
        return { structArray, endIndex: calldataIndex };
    }

    getFunctionAbiFromSelector(functionSelector: string) {
        if(!this.functions) {
            throw new Error(
                `ContractAnalyzer::getFunctionFromSelector - No functions declared for this ContractAnalyzer instance (functions: ${this.functions})`
            );
        }

        const fn = this.functions[functionSelector];

        if(!fn) {
            throw new Error(
                `ContractAnalyzer::getFunctionFromSelector - No functions matching this selector (selector: ${functionSelector})`
            );
        }

        return fn;
    }

    getStructAbiFromStructType(type: string) {
        if(!this.structs) {
            throw new Error(
                `ContractAnalyzer::getStructFromStructs - No struct specified for this instance (structs: ${this.structs})`
            );
        }
        
        const struct = this.structs[type];
        
        if(!struct) {
            throw new Error(
                `ContractAnalyzer::getStructFromStructs - No struct specified for this type (structType: ${type})`
            );
        }
        return struct;
    }

    getEventAbiFromKey(key: string) {
        if(!this.events) {
            throw new Error(
                `ContractAnalyzer::getEventFromKey - No events specified for this instance (events: ${this.events})`
            );
        }

        const event = this.events[key];

        if(!event) {
            throw new Error(
                `ContractAnalyzer::getEventFromKey - No events specified for this key (key: ${key})`
            );
        }
        
        return event;
    }

    get address() {
        return this._address;
    }
    
    get structs() {
        return this._structs;
    }

    get functions() {
        return this._functions;
    }

    get events() {
        return this._events;
    }
}