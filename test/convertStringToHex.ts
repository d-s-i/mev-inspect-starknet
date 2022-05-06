import { getSelectorFromName } from "starknet/utils/hash";
import { decodeShortString } from "starknet/dist/utils/shortString";

const findSelectorFromWordsList = function(selectorsToFind: string[]) {

    const commonWords = [
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
    ];
    const commonSelectors = commonWords.map(word => getSelectorFromName(word));

    let selectorNotFound = [];
    for(const selectorToFind of selectorsToFind) {
        if(commonSelectors.includes(selectorToFind)) {
            const word = commonWords[commonSelectors.indexOf(selectorToFind)];
            console.log(`${word}: ${selectorToFind}`);
        } else {
            selectorNotFound.push(selectorToFind);
        }
    }
    console.log("Done");
    console.log("selector not found: ", selectorNotFound);
}

findSelectorFromWordsList([
    "0x01fdac690af4653a82a099740177724f266c024b5eb2af5ad5a85980b29c2fb1",
    "0xe14a408baf7f453312eec68e9b7d728ec5337fbdf671f917ee8c80f3255232",
    "0xe316f0d9d2a3affa97de1d99bb2aac0538e2666d0d8545545ead241ef0ccab",
    "0x5ad857f66a5b55f1301ff1ed7e098ac6d4433148f0b72ebc4a2945ab85ad53",
    "0x182d859c0807ba9db63baf8b9d9fdbfeb885d820be6e206b9dab626d995c433",
    "0x278764b0e84f45a602e24e86f19a3e2af7956f2a9112d825c8b5ca7991c711f",
    "0x134692b230b9e1ffa39098904722134159652b09c5bc41d88d6698779d228ff",
    "0x34e55c1cd55f1338241b50d352f0e91c7e4ffad0e4271d64eb347589ebdfd16",
    "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9",
    "0x31214c7087b4ac614560f16e02d74d7f94af3dd7724860e0b98e32fe1261e13",
    "0xc186c011688ee049ea75dcc9871ac2c4ba4f3caf7418c724f224c1ed287c44",
    "0xfddc638e1f5f71961eca301d6193c838f86055357a33ca1dcdb8149c5af612"
]);