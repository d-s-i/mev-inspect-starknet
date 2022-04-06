import { defaultProvider } from "starknet";
import { getSelectorFromName } from "starknet/utils/hash";

const main = function(name: string) {
    console.log(`${name}: ${getSelectorFromName(name)}`);
}

const brutforceHexWithStrings = function(strings: string[]) {
    const unknownSelectors = [
        "0x01fdac690af4653a82a099740177724f266c024b5eb2af5ad5a85980b29c2fb1",
        "0xe14a408baf7f453312eec68e9b7d728ec5337fbdf671f917ee8c80f3255232",
        "0xe316f0d9d2a3affa97de1d99bb2aac0538e2666d0d8545545ead241ef0ccab",
        "0x5ad857f66a5b55f1301ff1ed7e098ac6d4433148f0b72ebc4a2945ab85ad53",
        "0x182d859c0807ba9db63baf8b9d9fdbfeb885d820be6e206b9dab626d995c433",
        "0x278764b0e84f45a602e24e86f19a3e2af7956f2a9112d825c8b5ca7991c711f",
        "0x134692b230b9e1ffa39098904722134159652b09c5bc41d88d6698779d228ff"
    ];

    for(const str of strings) {
        const selector = getSelectorFromName(str);
        if(unknownSelectors.includes(selector)) {
            console.log(`${str}: ${selector}`);
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
    "escape_signer",
    "get_approved",
    "is_approved_for_all",
    "balanceOf_",
    "balanceDetailsOf_",
    "tokenOfOwnerByIndex_",
    "ownerOf_",
    "tokenURI_data",
    "tokenURI_",
    "name",
    "symbol",
    "balanceOf",
    "balanceDetailsOf",
    "tokenOfOwnerByIndex",
    "ownerOf",
    "tokenURI",
    "tokenURIData",
    "getApproved",
    "isApprovedForAll"
]);
// getCodeOfAddress("0x04b05cce270364e2e4bf65bde3e9429b50c97ea3443b133442f838045f41e733");