# mev-inspect for StarkNet

This is a simple project aiming to analyze transactions in StarkNet blocks and give information about the actions done by participants of that block.
Actions like:
 - Arbitrage
 - Liquidation
 - ... more later (thinking about in-game actions mev transactions)

To use it, run `npm init` and you may also have to install the cairo-lang package (see https://www.cairo-lang.org/docs/quickstart.html).
It run better in a Linux environment, I'm using WSL2 in order to run the project (tutorial https://www.youtube.com/watch?v=-atblwgc63E).

If you see code that can be improved, logic flaws, or any improvement that can be made, please reach out to me on discord dsi#9447, I'm here to learn as well.

# What can you do with it now:

1) `BlockAnalyzer` - Given a block, analyze events and calldata of each transactions if possible
2) `ContractAnalyzer` - Allow to organize call to a certain contract address
3) `Transaction Analyzer` - Given a transaction, return an organized version of a transaction calldata with Call array (the contracts that get called within the tx) and the calldata

# Current Notice

You need to change `GetBlockResponse` and `GetCodeResponse` in `node_modules/starknet/dist/types/api.d.ts` to:

```
import { Event } from 'starknet-analyzer/src/types/rawStarknet';
export declare type GetBlockResponse = {
    block_number: number;
    state_root: string;
    block_hash: string;
    transactions: Transaction[];
    timestamp: number;
    transaction_receipts: TransactionReceipt[];
    previous_block_hash: string;
    status: Status;
};
export declare type TransactionReceipt = {
    status: Status;
    transaction_hash: string;
    transaction_index: number;
    block_hash: string;
    block_number: BlockNumber;
    l2_to_l1_messages: string[];
    events: Event[];
};
```

Please if you use it, feel free to give me any feedback. It's really important for my learning :)
Telegram: @real_dsi

Discord: 👑 dsi#9401

Email: dsi9999777@gmail.com

Thank you so much