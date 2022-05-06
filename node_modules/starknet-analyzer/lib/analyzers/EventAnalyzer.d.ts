import { Provider } from "starknet";
import { SwapAnalyzer } from "./SwapAnalyzer";
import { SwappersTree, TransfersTreePerAccount } from "../types/organizedStarknet";
export declare class EventAnalyzer extends SwapAnalyzer {
    constructor(provider: Provider);
    analyzeEventsInBlock(blockNumber: number): Promise<{
        swaps: SwappersTree;
        transfers: TransfersTreePerAccount;
    }>;
}
//# sourceMappingURL=EventAnalyzer.d.ts.map