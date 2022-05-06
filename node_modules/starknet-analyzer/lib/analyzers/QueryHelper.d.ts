import { Provider } from "starknet";
export declare class QueryHelper {
    private _provider;
    private _tokens;
    private _pairs;
    private _factoriesAddresses;
    constructor(provider: Provider);
    query(contractAddress: string, entrypoint: string, calldata?: any[]): Promise<string[] | undefined>;
    getFactoryAddr(lpTokenAddress: string): Promise<string | undefined>;
    getSymbol(_tokenAddress: string): Promise<string | undefined>;
    getToken0AndToken1(contractAddress: string): Promise<{
        token0: string | undefined;
        token1: string | undefined;
    }>;
    getSymbolsAndDecimalsOfTokens(tokensAddresses: string[]): Promise<(string | number)[]>;
    writeSymbolAndDecimals(index: string, value: {
        symbol: string;
        decimals: number;
    }): void;
    checkResultIsDefined(results: any[]): void;
    sleep(ms: number): Promise<unknown>;
    _query(contractAddress: string, entrypoint: string, calldata?: any[]): Promise<string[]>;
    get provider(): Provider;
    get tokens(): {
        [tokenAddress: string]: {
            symbol: string;
            decimals: number;
        };
    };
    get pairs(): {
        [lpTokenAddress: string]: {
            token0: string | undefined;
            token1: string | undefined;
        };
    };
    get factoriesAddresses(): {
        [lpTokenAddress: string]: string;
    };
}
//# sourceMappingURL=QueryHelper.d.ts.map