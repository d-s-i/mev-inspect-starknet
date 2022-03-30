import path from "path";
import fs from "fs-extra";
import { RangeMilestones, ContractInfos } from "./types";

const _importDynamic = new Function("modulePath", "return import(modulePath)");

export const fetch = async function (...args: any) {
    const {default: fetch} = await _importDynamic("node-fetch");
    return fetch(...args);
}

export const sleep = async function(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const sortAddressesPerActivity = function(contractInteractions: ContractInfos) {
    const sortedAccountsArray = Object.entries(contractInteractions).sort(([, amountA], [, amountB]) => amountB.transactionCount - amountA.transactionCount);
    let sortedAccountsObject: ContractInfos = {};
    for(const [addr, object] of sortedAccountsArray) {
        sortedAccountsObject[addr] = object;
    }

    return sortedAccountsObject;
}

export const displayProgress = function(
    { milestoneOne, milestoneTwo, milestoneThree, milestoneFour } : RangeMilestones,
    currentIndex: number,
    actionTitle: string
) {

    if(currentIndex === milestoneOne) console.log(`25% of ${actionTitle} done`);
    if(currentIndex === milestoneTwo) console.log(`50% of ${actionTitle} done`);
    if(currentIndex === milestoneThree) console.log(`75% of ${actionTitle} done`);
    if(currentIndex === milestoneFour) console.log(`100% of ${actionTitle} done`);

}

export const writeInFile = function(pathArray: string[], fileContent: any) {
    const buildPath = path.resolve(__dirname, ...pathArray);
    console.log(buildPath);
    
    fs.outputJsonSync(
        buildPath,
        fileContent
    );
}