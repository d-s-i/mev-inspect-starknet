import { defaultProvider } from "starknet";
import { getSelectorFromName } from "starknet/utils/hash";

const main = function(name: string) {
    console.log(`${name}: ${getSelectorFromName(name)}`);
}

const brutforceHexWithStrings = function(strings: string[]) {
    const unknownSelectors = [
        "0xe14a408baf7f453312eec68e9b7d728ec5337fbdf671f917ee8c80f3255232",
        "0xe316f0d9d2a3affa97de1d99bb2aac0538e2666d0d8545545ead241ef0ccab",
        "0x34e55c1cd55f1338241b50d352f0e91c7e4ffad0e4271d64eb347589ebdfd16",
        "0x5ad857f66a5b55f1301ff1ed7e098ac6d4433148f0b72ebc4a2945ab85ad53",
        "0x24e8dab991bfebadc737b0ad9d332d24f4d061c934ddce65361d143a94380ed"
    ];

    for(const str of strings) {
        const selector = getSelectorFromName(str);
        if(unknownSelectors.includes(selector)) {
            console.log(`${str}: ${selector}`);
        } else {
            console.log(`Didn't find a selector for string ${str} (${selector})`);
        }
    }
    console.log("Done.");
}



const getCodeOfAddress = async function(address: string) {
    const code = await defaultProvider.getCode(address);
    console.log(code.abi[5]);
}

// main("Sync");
// brutforceHexWithStrings([
//     "AddLiquidity",
//     "RemoveLiquidity",
//     "Transfer",
//     "Approve",
//     "Approval",
//     "Burn",
//     "Mint",
//     "Swap",
//     "Exchange",
//     "add_liquidity",
//     "transfer",
//     "Sync"
// ]);
getCodeOfAddress("0x04b05cce270364e2e4bf65bde3e9429b50c97ea3443b133442f838045f41e733");