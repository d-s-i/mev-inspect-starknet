import { Provider } from "starknet";
import { OrganizedSwap, SwappersTree, OrganizedEvent, OrganizedTransaction } from "../types/organizedStarknet";
import { TransferAnalyzer } from "./TransferAnalyzer";
export declare class SwapAnalyzer extends TransferAnalyzer {
    private _swappersPerBlock;
    private _ALPHA_ROAD_FACTORY;
    constructor(provider: Provider);
    analyzeSwapsInBlock(transactions: OrganizedTransaction[]): Promise<SwappersTree>;
    analyzeSwap(event: OrganizedEvent): Promise<OrganizedSwap>;
    /**
     * @dev The JediSwap team puts amounts0In and amounts1In in the event object. On of those will not be equal to 0,
     * this mean that this is the token that was sent in. Same for the tokenOut.
     * If token0 is tokenIn, then token1 is tokenOut, so I only check if tokenIn = token0 or token1 and I deduce tokenOut.
     * @param calldata - Calldata of the organized event associated to the transaction
     * @param token0 - address of the token0
     * @param token1 - address of the token1
     * @returns an organized swap object
     */
    interpretMeshSwap(calldata: any[], token0: string, token1: string): Promise<{
        swapperAddress: string;
        tokenIn: {
            amount: import("ethers").BigNumber;
            address: string;
            symbol: string;
            decimals: number;
        };
        tokenOut: {
            amount: import("ethers").BigNumber;
            address: string;
            symbol: string;
            decimals: number;
        };
    }>;
    interpretAlphaRoadSwap(calldata: any[]): Promise<{
        swapperAddress: any;
        tokenIn: {
            amount: import("ethers").BigNumber;
            address: any;
            symbol: string;
            decimals: number;
        };
        tokenOut: {
            amount: import("ethers").BigNumber;
            address: any;
            symbol: string;
            decimals: number;
        };
    }>;
    getToken0AndToken1SymbolAndDecimals(token0Address: string, token1Address: string): Promise<{
        token0Symbol: string;
        token0Decimals: number;
        token1Symbol: string;
        token1Decimals: number;
    }>;
    populateSwappersObject(swapObj: SwappersTree, value: OrganizedSwap): SwappersTree;
    populateSwappersPerBlock(blockNumber: number, swappersObj: SwappersTree): void;
    get swappersPerBlock(): {
        [blockNumber: number]: SwappersTree;
    };
    get ALPHA_ROAD_FACTORY(): string;
}
//# sourceMappingURL=SwapAnalyzer.d.ts.map