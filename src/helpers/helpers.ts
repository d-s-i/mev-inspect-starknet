import path from "path";
import fs from "fs-extra";
import { BigNumber } from "ethers";
import { OrganizedTransaction } from "starknet-analyzer/src/types/organizedStarknet";
import { BlockOrganizer } from "starknet-analyzer/lib/organizers/BlockOrganizer";
import { Provider } from "starknet";

const _importDynamic = new Function("modulePath", "return import(modulePath)");

export const fetch = async function (...args: any) {
    const {default: fetch} = await _importDynamic("node-fetch");
    return fetch(...args);
}

export const sleep = async function(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const toBigIntStr = function(str: string) {
    return BigNumber.from(str).toBigInt().toString();
}

export const uint256ToBN = function(num: { low: string, high: string }) {
    return BigNumber.from(num.low).add(num.high);
}

export const getBlock = async function(blockNumber: number, provider: Provider) {
    let transactions: OrganizedTransaction[];
    const buildPath = path.resolve(__dirname, `../data/${blockNumber}.json`);
    if(fs.existsSync(buildPath)) {
        transactions = fs.readJsonSync(buildPath);
    } else {
        const block = await provider.getBlock(blockNumber);
        const blockAnalyzer = new BlockOrganizer(provider);
        transactions = await blockAnalyzer.organizeTransactions(block);
        writeInFile(["../", "data", `${blockNumber}.json`], transactions);
    }
    return transactions;
}

export const writeInFile = function(pathArray: string[], fileContent: any) {
    const buildPath = path.resolve(__dirname, ...pathArray);
    
    fs.outputJsonSync(
        buildPath,
        fileContent
    );
}