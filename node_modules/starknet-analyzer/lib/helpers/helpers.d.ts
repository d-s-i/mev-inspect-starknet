import { BigNumber } from "ethers";
export declare const sleep: (ms: number) => Promise<unknown>;
export declare const getFullSelector: (entrypoint: string) => string;
export declare const uint256ToBN: (num: {
    low: string;
    high: string;
}) => BigNumber;
export declare function forceCast<T>(input: any): T;
//# sourceMappingURL=helpers.d.ts.map