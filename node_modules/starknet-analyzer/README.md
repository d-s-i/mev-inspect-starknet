# starknet-analyzer

# Help analyze onchain data

## Transform this:
```
[
  '0x4',
  '0x74555344432f7457455448',
  '0x2c03d22f43898f146e026a72f4cf37b9e898b70a11c4731665e0d75ce87700d',
  '0x152e41ba9e1f486b9b8e15',
  '0x0',
  '0x44e592375a34fb4fdd3a5e2694cd2cbbcd61305b95cfac9d40c1f02ac64aa66',
  '0x4f993197257f3ffa0247049',
  '0x0',
  '0x12c',
  '0x0',
  '0x74434f4d502f7455534443',
  '0x44e592375a34fb4fdd3a5e2694cd2cbbcd61305b95cfac9d40c1f02ac64aa66',
  '0x45a21b6e7e1b4de2fd552',
  '0x0',
  '0x7f6e6a3b90ebe02190fba0269becaf8828b9219e92a7a041fa6da3ef11d0c6a',
  '0x4c9fbe35c34bb1f95da',
  '0x0',
  '0x12c',
  '0x0',
  '0x7473742f77657468',
  '0x2c03d22f43898f146e026a72f4cf37b9e898b70a11c4731665e0d75ce87700d',
  '0x49557ba2aade631b1c0bc15',
  '0x0',
  '0x7394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10',
  '0x32394234fe67c75e124bb05f867a1a8',
  '0x0',
  '0x12c',
  '0x0',
  '0x7473742f7475736463',
  '0x44e592375a34fb4fdd3a5e2694cd2cbbcd61305b95cfac9d40c1f02ac64aa66',
  '0x8aae3d253a05bff445fd4e36',
  '0x0',
  '0x7394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10',
  '0xa97d373e0da43f12c65ba66a49e208a',
  '0x0',
  '0x12c',
  '0x0'
]
```

## Into this:

```
[
    {
        name: 'pools_ptr_len',
        type: 'felt',
        value: BigNumber { _hex: '0x04', _isBigNumber: true }
    }
    {
        name: 'pools_ptr',
        type: 'Pool*',
        value: [
            {
                name: BigNumber,
                token_a_address: BigNumber,
                token_a_reserves: BigNumber,
                token_b_address: BigNumber,
                token_b_reserves: BigNumber,
                fee_percentage: BigNumber,
                cfmm_type: BigNumber
            },
            {
                name: BigNumber,
                token_a_address: BigNumber,
                token_a_reserves: BigNumber,
                token_b_address: BigNumber,
                token_b_reserves: BigNumber,
                fee_percentage: BigNumber,
                cfmm_type: BigNumber
            },
            {
                name: BigNumber,
                token_a_address: BigNumber,
                token_a_reserves: BigNumber,
                token_b_address: BigNumber,
                token_b_reserves: BigNumber,
                fee_percentage: BigNumber,
                cfmm_type: BigNumber
            },
            {
                name: BigNumber,
                token_a_address: BigNumber,
                token_a_reserves: BigNumber,
                token_b_address: BigNumber,
                token_b_reserves: BigNumber,
                fee_percentage: BigNumber,
                cfmm_type: BigNumber
            }
        ]
    }
]
```

# Contain

Organizers: 
1) `BlockAnalyzer` - Given a block, organize transactions with events and calldata to each funcions (if possible).
2) `TransactionCallAnalyzer` - Given a transaction, can manipulate and organize the calldata and events. Used by BlockAnalyzer.
3) `ContractCallAnalyzer` - Organize inputs, outputs and events of a function call for a given contract.

Organizers take a calldata and organize it into a usable object.

Analyzers:
1) `QueryHelpers` - A simple class for recurring queries that store those recurring results. If a recurring query has already been made, it doesn't query it again and save you a node call.
2) `TransferAnalyzer` - Given a block, return all transfers IN and OUT for every account that made a transfer within the block (as long as a standard Transfer event was triggered)
3) `SwapAnalyzer` - Given a block, return all swaps made by an account within the block (as long as a known swap event was triggered). Currently support Mesh Finance and Alpha Road. Hoping to add more
4) `EventAnalyzer` - Given a block, return all swaps and transfers made within the block. It is a little bit more efficient than `SwapAnalyzer` or `TransferAnalyzer` alone as it store more data in the `QueryHelper` class. Hoping to add Liquidation soon. 

# Tips

Should be run on Linux

# Examples

# Organizers

## ContractCallOrganizer

### How to intiialize: 

```
import { defaultProvider } from "starknet";
import { ContractCallOrganizer } from "starknet-analyzer/lib/organizers/ContractCallOrganizer";

const contractAddr = "0x0000...e54";

const contractCallOrganizer = await new ContractCallOrganizer(contractAddress).initialize(defaultProvider);
```

```
import { defaultProvider } from "starknet";
import { ContractCallOrganizer } from "starknet-analyzer/lib/analyzers/ContractCallOrganizer";

const contractAddr = "0x0000...e54";

const { events, functions, structs } = await ContractCallOrganizer.getContractAbi(contractAddr, defaultProvider);
const contractCallOrganizer = new ContractCallOrganizer(contractAddr, structs, functions, events);
```

### How to use:

#### Function outputs (example: view functions)

```
import { defaultProvider } from "starknet";
import { BigNumber } from "ethers";
import { ContractCallOrganizer } from "starknet-analyzer/lib/organizers/ContractCallOrganizer";

const contractAddr = "0x0000...e54";
const entrypoint = "get_amounts_out";

const { result: rawAmountsOut } = await defaultProvider.callContract({
    contractAddress: contractAddr,
    entrypoint
});

const rawAmountsOutBN = rawAmountsOut.map((rawPool: any) => BigNumber.from(rawPool));

const contractCallOrganizer = await new ContractCallOrganizer(contractAddress).initialize(defaultProvider);

const { subcalldata: amountsOut } = contractCallOrganizer.organizeFunctionOutput(
    getFullSelector(entrypoint),
    rawAmountsOutBN
);

console.log(amountsOut);

/*
    output something like: 
    {
        amountIn: { low: "0x0154eda", high: "0x0" },
        amountOut: { low: "0x41da25", high: "0x0" }
    }
    instead of:
    [
        "0x2",
        "0x0154eda",
        "0x0",
        "0x41da25",
        "0x0"
    ]
*/
```

#### Function Inputs:

Not really used on its own. Work better with a full transaction calldata.
See `TransactionCallAnalyzer.ts::getCalldataPerCall` for an example.

#### Events:

```
import { defaultProvider } from "starknet";
import { ContractCallOrganizer } from "starknet-analyzer/lib/analyzers/ContractCallOrganizer";

const contractAddr = "0x0000...e54";

const contractCallOrganizer = await new ContractCallOrganizer(contractAddress).initialize(defaultProvider);

const block = await defaultProvider.getBlock(1145);
const receipt = block.transaction_receipts[0] as TransactionReceipt; // pick a random receipt

let events: OrganizedEvent[] = [];
for(const event of receipt.events) {
    const contractCallAnalyzer = await this.getContractOrganizer(event.from_address);
    const eventCalldata = await contractCallOrganizer.organizeEvent(event);
    if(eventCalldata) {
        events.push(eventCalldata);
    }
}

console.log(events);

/*
    output something like:
    {
        name: "Transfer", 
        transmitterContract: "0x0000...e54", 
        calldata: {
            "amount": { low: "0x1554a", high: "0x0" };
        } 
    }
*/
```

## TransactionCallOrganizer

### How to use:

```
import { TransactionCallOrganizer } from "starknet-analyzer/lib/organizers/TransactionCallOrganizer";
import { defaultProvider } from "starknet";

const block = await defaultProvider.getBlock(99874);
const transaction = block.transactions[0] as InvokeFunctionTransaction;

const transactionCallOrganizer = new TransactionCallOrganizer(defaultProvider);
const functionCalls = await transactionCallOrganizer.getCalldataPerCallFromTx(tx);

/*
    return something like:
    {
        name: "approve";
        to: "0xa14...c56";
        calldata: [
            {
                to: 
            }, {
                amount: 
            }
        ];
    }
*/
```

## BlockOrganizer

### How to use:

```
import { defaultProvider } from "starknet";
import { BlockOrganizer } from "./organizers/BlockOrganizer";

const blockOrganizer = new BlockOrganizer(defaultProvider);
const block = await defaultProvider.getBlock(blockNumber);
const transactions = await blockOrganizer.organizeTransactions(block);

/*
    return something like:
    {
        hash: string,
        events: OrganizedEvent[],
        origin: string,
        entrypointSelector: string,
        entrypointType?: string,
        functionCalls?: OrganizedCalldata,
        maxFee?: string,
        type: string
    }
*/
```

# Analyzers

## TransferAnalyzer

### How to use:

```
    import { defaultProvider } from "starknet";
    import { BlockOrganizer } from "starknet-analyzer/lib/organizers/BlockOrganizer";
    import { TransferAnalyzer } from "starknet-analyzer/lib/analyzers/EventAnalyzer";


    const block = await defaultProvider.getBlock(blockNumber);
    const blockOrganizer = new BlockOrganizer(provider);
    const transactions = await blockOrganizer.organizeTransactions(block);

    const transfersAnalyzer = new TransferAnalyzer(defaultProvider);
    const transfers = await transfersAnalyzer.analyzeTransfersInBlock(transactions);
```

## SwapAnalyzer

### How to use:

```
    import { defaultProvider } from "starknet";
    import { BlockOrganizer } from "starknet-analyzer/lib/organizers/BlockOrganizer";
    import { SwapAnalyzer } from "starknet-analyzer/lib/analyzers/SwapAnalyzer";


    const block = await defaultProvider.getBlock(blockNumber);
    const blockOrganizer = new BlockOrganizer(defaultProvider);
    const transactions = await blockOrganizer.organizeTransactions(block);

    const swapAnalyzer = new SwapAnalyzer(defaultProvider);
    const swaps = await swapAnalyzer.analyzeSwapsInBlock(transactions);
```

## EventAnalyzer

### How to use:

```
    import { defaultProvider } from "starknet";
    import { EventAnalyzer } from "starknet-analyzer/lib/analyzers/EventAnalyzer";

    const eventAnalyzer = new EventAnalyzer(defaultProvider);
    const { swaps, transfers } = await eventAnalyzer.analyzeEventsInBlock(132974);
```