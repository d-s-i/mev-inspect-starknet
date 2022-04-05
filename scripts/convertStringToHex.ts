import { defaultProvider } from "starknet";
import { getSelectorFromName } from "starknet/utils/hash";

const main = function(name: string) {
    console.log(`${name}: ${getSelectorFromName(name)}`);
}

const brutforceHexWithStrings = function(strings: string[]) {
    const unknownSelectors = [
        "0x01fdac690af4653a82a099740177724f266c024b5eb2af5ad5a85980b29c2fb1"
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
brutforceHexWithStrings([
    "AddLiquidity",
    "RemoveLiquidity",
    "Transfer",
    "Approve",
    "Approval",
    "Burn",
    "Mint",
    "Swap",
    "Exchange",
    "add_liquidity",
    "transfer",
    "Sync",
    "__execute__",
    "initialize",
    "upgrade",
    "change_signer",
    "change_guardian",
    "change_guardian_backup",
    "trigger_escape_signer",
    "trigger_escape_guardian",
    "cancel_escape",
    "escape_guardian",
    "escape_signer"
]);
// getCodeOfAddress("0x04b05cce270364e2e4bf65bde3e9429b50c97ea3443b133442f838045f41e733");