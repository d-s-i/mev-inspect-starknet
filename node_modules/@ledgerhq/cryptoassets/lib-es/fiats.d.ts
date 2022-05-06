import type { FiatCurrency } from "./types";
/**
 *
 * @param {*} ticker
 */
export declare function hasFiatCurrencyTicker(ticker: string): boolean;
/**
 *
 * @param {*} ticker
 */
export declare function findFiatCurrencyByTicker(ticker: string): FiatCurrency | null | undefined;
/**
 *
 * @param {*} ticker
 */
export declare function getFiatCurrencyByTicker(ticker: string): FiatCurrency;
/**
 *
 */
export declare function listFiatCurrencies(): FiatCurrency[];
//# sourceMappingURL=fiats.d.ts.map