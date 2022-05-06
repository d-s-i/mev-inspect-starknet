export type { CryptoCurrencyIds } from "./currencies";
/**
 *
 */
export declare type Unit = {
    name: string;
    code: string;
    magnitude: number;
    showAllDigits?: boolean;
    prefixCode?: boolean;
};
/**
 *
 */
declare type CurrencyCommon = {
    name: string;
    ticker: string;
    units: Unit[];
    symbol?: string;
    disableCountervalue?: boolean;
    delisted?: boolean;
    countervalueTicker?: string;
};
/**
 *
 */
export declare type TokenCurrency = CurrencyCommon & {
    type: "TokenCurrency";
    id: string;
    ledgerSignature?: string;
    contractAddress: string;
    parentCurrency: CryptoCurrency;
    tokenType: string;
    compoundFor?: string;
};
/**
 *
 */
export declare type FiatCurrency = CurrencyCommon & {
    type: "FiatCurrency";
};
/**
 *
 */
export declare type ExplorerView = {
    tx?: string;
    address?: string;
    token?: string;
};
/**
 *
 */
export declare type CryptoCurrency = CurrencyCommon & {
    type: "CryptoCurrency";
    id: string;
    forkedFrom?: string;
    managerAppName: string;
    coinType: number;
    scheme: string;
    color: string;
    family: string;
    blockAvgTime?: number;
    supportsSegwit?: boolean;
    supportsNativeSegwit?: boolean;
    isTestnetFor?: string;
    bitcoinLikeInfo?: {
        P2PKH: number;
        P2SH: number;
        XPUBVersion?: number;
        hasTimestamp?: boolean;
    };
    ethereumLikeInfo?: {
        chainId: number;
        networkId?: number;
        baseChain?: string;
        hardfork?: string;
    };
    explorerViews: ExplorerView[];
    terminated?: {
        link: string;
    };
    deviceTicker?: string;
};
/**
 *
 */
export declare type Currency = FiatCurrency | CryptoCurrency | TokenCurrency;
//# sourceMappingURL=types.d.ts.map