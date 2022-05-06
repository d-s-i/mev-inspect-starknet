import { Provider } from "starknet";
import { decodeShortString } from "starknet/dist/utils/shortString";
import { uint256ToBN } from "../helpers/helpers";

import { OrganizedSwap, SwappersTree, OrganizedEvent, OrganizedTransaction } from "../types/organizedStarknet";
import { TransferAnalyzer } from "./TransferAnalyzer";

export class SwapAnalyzer extends TransferAnalyzer {

    private _swappersPerBlock: { [blockNumber: number]: SwappersTree };
    private _ALPHA_ROAD_FACTORY = "0x373c71f077b96cbe7a57225cd503d29cadb0056ed741a058094234d82de2f9";
    
    constructor(provider: Provider) {
        super(provider);
        this._swappersPerBlock = {};
    }

    async analyzeSwapsInBlock(transactions: OrganizedTransaction[]) {

        let _swappers: SwappersTree = {};
        for(const tx of transactions) {
            for(const event of tx.events) {
                if(event.name === "Swap") {
                    const decodedSwap = await this.analyzeSwap(event);
                    _swappers = this.populateSwappersObject(_swappers, decodedSwap);
                }
            }
        }
        return _swappers;
    }

    async analyzeSwap(event: OrganizedEvent) {
        const { token0, token1 } = await super.getToken0AndToken1(event.transmitterContract);
        const factoryAddr = await super.getFactoryAddr(event.transmitterContract);
        const symbol = await super.getSymbol(event.transmitterContract);
        
        let decodedSwap: OrganizedSwap;
        if(symbol && token0 && token1 && decodeShortString(symbol) === "MGP") { // Mesh Finance Event Implementation
            decodedSwap = await this.interpretMeshSwap(event.calldata, token0, token1);
        } else if(factoryAddr === this.ALPHA_ROAD_FACTORY) { // Alpha Road Implementation
            decodedSwap = await this.interpretAlphaRoadSwap(event.calldata);
        } else {
            decodedSwap = await this.interpretAlphaRoadSwap(event.calldata);
        }
        await this.sleep(1000);
        return decodedSwap;

    }

    /**
     * @dev The JediSwap team puts amounts0In and amounts1In in the event object. On of those will not be equal to 0,
     * this mean that this is the token that was sent in. Same for the tokenOut.
     * If token0 is tokenIn, then token1 is tokenOut, so I only check if tokenIn = token0 or token1 and I deduce tokenOut.
     * @param calldata - Calldata of the organized event associated to the transaction
     * @param token0 - address of the token0
     * @param token1 - address of the token1
     * @returns an organized swap object
     */
    async interpretMeshSwap(calldata: any[], token0: string, token1: string) {
    
        const {
            token0Decimals,
            token1Decimals,
            token0Symbol,
            token1Symbol
        } = await this.getToken0AndToken1SymbolAndDecimals(token0, token1);
    
        if(!uint256ToBN(calldata[1].value).eq(0)) { // calldata[1].value = amount0In is amountIn
    
            return {
                swapperAddress: calldata[5].value as string,
                tokenIn: { 
                    amount: uint256ToBN(calldata[1].value), 
                    address: token0 as string, 
                    symbol: token0Symbol, 
                    decimals: token0Decimals
                },
                tokenOut: { 
                    amount: uint256ToBN(calldata[4].value), 
                    address: token1 as string, 
                    symbol: token1Symbol, 
                    decimals: token1Decimals
                }
            }
        } else { // calldata[1].value = amount1In is amountIn
    
            return {
                swapperAddress: calldata[5].value as string,
                tokenIn: { 
                    amount: uint256ToBN(calldata[2].value), 
                    address: token1 as string, 
                    symbol: token1Symbol,
                    decimals: token1Decimals
                },
                tokenOut: { 
                    amount: uint256ToBN(calldata[3].value), 
                    address: token0 as string, 
                    symbol: token0Symbol,
                    decimals: token0Decimals
                }
            }
        }
    
    }
    
    async interpretAlphaRoadSwap(calldata: any[]) {

        const {
            token0Decimals,
            token1Decimals,
            token0Symbol,
            token1Symbol
        } = await this.getToken0AndToken1SymbolAndDecimals(calldata[1].value, calldata[2].value);
    
        let tokenInSymb;
        let tokenInDecimals;
        let tokenOutSymb;
        let tokenOutDecimals;
        if(calldata[1].value === calldata[1].value) {
            tokenInSymb = token0Symbol;
            tokenInDecimals = token0Decimals;
            tokenOutSymb = token1Symbol;
            tokenOutDecimals = token1Decimals;
            
        } else {
            tokenInSymb = token1Symbol;
            tokenInDecimals = token1Decimals;
            tokenOutSymb = token0Symbol;
            tokenOutDecimals = token0Decimals;
        }
        
        return {
            swapperAddress: calldata[0].value,
            tokenIn: { 
                amount: uint256ToBN(calldata[3].value), 
                address: calldata[1].value, 
                symbol: tokenInSymb,
                decimals: tokenInDecimals
            },
            tokenOut: { 
                amount: uint256ToBN(calldata[4].value), 
                address: calldata[2].value, 
                symbol: tokenOutSymb,
                decimals: tokenOutDecimals
            }
        }
    }

    async getToken0AndToken1SymbolAndDecimals(token0Address: string, token1Address: string) {
        const res = await super.getSymbolsAndDecimalsOfTokens([token0Address, token1Address]);
        const token0Symbol = res![0] as string;
        const token0Decimals = +res![1];
        const token1Symbol = res![2] as string;
        const token1Decimals = +res![3];

        return {
            token0Symbol,
            token0Decimals,
            token1Symbol,
            token1Decimals,
        }
    }
    
    populateSwappersObject(swapObj: SwappersTree, value: OrganizedSwap) {
        if(!swapObj[value.swapperAddress]) {
            swapObj[value.swapperAddress] = [value];
        } else {
            swapObj[value.swapperAddress].push(value);
        }
        return swapObj;
    }

    populateSwappersPerBlock(blockNumber: number, swappersObj: SwappersTree) {
        this._swappersPerBlock[blockNumber] = swappersObj;
    }

    get swappersPerBlock() {
        return this._swappersPerBlock;
    }

    get ALPHA_ROAD_FACTORY() {
        return this._ALPHA_ROAD_FACTORY;
    }
    
}