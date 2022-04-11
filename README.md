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

There is a problem with some type declaration in the starknetjs type declaration. I had to change the `GetBlockResponse` type, located in `node_modules/starknet/dist/provider/api.d.ts` to this

```
export declare type GetBlockResponse = {
    block_number: number;
    state_root: string;
    block_hash: string;
    transactions: Transaction[]; // this has changed
    timestamp: number;
    transaction_receipts: TransactionReceipt[]; // this has changed
    parent_block_hash: string;
    status: Status;
};
```

and

```
export declare type TransactionReceipt = {
    status: Status;
    transaction_hash: string;
    transaction_index: number;
    block_hash: string;
    block_number: BlockNumber;
    l2_to_l1_messages: string[];
    events: Event[]; // this has changed
};
```

with Event being:

```
export declare type Event = {
    from_address: string;
    keys: Array<any>;
    data: Array<any>;
};
```

I also added an EventAbi in `node_modules/starknet/types/lib.d.ts` and `node_modules/starknet/dist/types/lib.d.ts` (only useful in dist, but I'm saying both just in case)
```
export declare type EventAbi = {
  data: { name: string, type: string }[],
  keys: string[],
  name: string,
  type: string
};
```

Please if you use it, feel free to give me any feedback. It's really important for my learning :)
Telegram: @real_dsi

Discord: 👑 dsi#9401

Email: dsi9999777@gmail.com

Thank you so much