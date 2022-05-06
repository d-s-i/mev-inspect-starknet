import { BigNumber } from "ethers";
import { Provider } from "starknet";
import { 
    OrganizedEvent, 
    OrganizedTransaction, 
    OrganizedTransfer, 
    TransfersTree, 
    TransfersTreePerAccount 
} from "../types/organizedStarknet";
import { QueryHelper } from "./QueryHelper";

export class TransferAnalyzer extends QueryHelper {
    private _transfersPerBlock: { [blockNumber: string]: TransfersTreePerAccount };

    constructor(provider: Provider) {
        super(provider);
        this._transfersPerBlock = {};
    }

    async analyzeTransfersInBlock(transactions: OrganizedTransaction[]) {

        let _transfers: TransfersTreePerAccount = {};
        for(const tx of transactions) {
            for(const event of tx.events) {
                if(event.name === "Transfer") {
 
                    const decodedTransfer = await this.analyzeTransfer(tx, event);
                    _transfers = this.populateTransfersObject(_transfers, decodedTransfer);
                }
            }
        }
        return _transfers;
    }

    async analyzeTransfer(transaction: OrganizedTransaction, event: OrganizedEvent) {
        const from = event.calldata[0].value;
        const to = event.calldata[1].value;
        const value = BigNumber.from(event.calldata[2].value.low).add(event.calldata[2].value.high);

        const { symbol, decimals } = await this.getSymbolAndDecimalOfToken(event.transmitterContract);

        return { from, to, value, hash: transaction.hash, symbol, decimals };
    }

    async getSymbolAndDecimalOfToken(tokenAddress: string) {
        const [_symbol, _decimals] = await super.getSymbolsAndDecimalsOfTokens([tokenAddress]);
        const symbol = _symbol as string;
        const decimals = +_decimals;
        return { symbol, decimals };
    }

    populateTransfersPerBlock(blockNumber: number, transfersObj: TransfersTreePerAccount) {
        this._transfersPerBlock[blockNumber] = transfersObj;

    }
    
    populateTransfersObject(
        transfers: TransfersTreePerAccount,
        { from, to, value, hash, symbol, decimals } : OrganizedTransfer
    ) {
        let _transfers = transfers;
        _transfers[from] = this._populateSentTransfers(
            transfers[from],
            { from, to, value, hash, symbol, decimals }
        );
        _transfers[to] = this._populateReceivedTransfers(
            transfers[to],
            { from, to, value, hash, symbol, decimals }
        );
    
        return _transfers;
    }

    _populateSentTransfers(
        transfersObj: TransfersTree,
        value: OrganizedTransfer
    ) {
        if(!transfersObj || !transfersObj.sent) {
            if(!transfersObj) transfersObj = { received: undefined, sent: undefined };
            transfersObj = {
                sent: [value],
                received: transfersObj.received
            };
        } else {
            transfersObj.sent!.push(value);
        }
        return transfersObj;
    }
    
    _populateReceivedTransfers(
        transfersObj: TransfersTree, 
        value: OrganizedTransfer
    ) {
        if(!transfersObj || !transfersObj.received) {
            if(!transfersObj) transfersObj = { received: undefined, sent: undefined };
            transfersObj = {
                received: [value],
                sent: transfersObj.sent
            };
        } else {
            transfersObj.received!.push(value);
        }
        return transfersObj;
    }

    get transfersPerBlock() {
        return this._transfersPerBlock;
    }
}