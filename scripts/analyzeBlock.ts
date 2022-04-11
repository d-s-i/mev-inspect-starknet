import { defaultProvider } from "starknet";
import { BlockAnalyzer } from "./analyzers/BlockAnalyzer";

const analyzeBlock = async function(blockNumber: number) {

    const blockAnalyzer = new BlockAnalyzer(defaultProvider);
    const block = await defaultProvider.getBlock(blockNumber);
    const transactions = await blockAnalyzer.organizeTransactions(block);

    console.log(transactions);

    console.log("done");
}

analyzeBlock(140046);