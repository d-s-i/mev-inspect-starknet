import { defaultProvider } from "starknet";

const main = async function(blockNumber: number) {
    const block = await defaultProvider.getBlock(blockNumber);
    const transactions = block.transactions;
    const receipt = block.transaction_receipts;

    console.log("---------- TRANSACTIONS ----------");
    console.log(transactions);
    console.log("---------- RECEIPTS ----------");
    // console.log(receipt[0].events);
    
}

main(123123);