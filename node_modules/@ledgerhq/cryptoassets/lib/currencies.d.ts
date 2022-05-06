import type { CryptoCurrency } from "./types";
declare const cryptocurrenciesById: Record<string, CryptoCurrency>;
/**
 *
 */
export declare type CryptoCurrencyIds = keyof typeof cryptocurrenciesById;
/**
 *
 * @param {string} id
 * @param {CryptoCurrency} currency
 */
export declare function registerCryptoCurrency(id: string, currency: CryptoCurrency): void;
/**
 *
 * @param {*} withDevCrypto
 * @param {*} withTerminated
 */
export declare function listCryptoCurrencies(withDevCrypto?: boolean, withTerminated?: boolean): CryptoCurrency[];
/**
 *
 * @param {*} f
 */
export declare function findCryptoCurrency(f: (arg0: CryptoCurrency) => boolean): CryptoCurrency | null | undefined;
/**
 *
 * @param {*} scheme
 */
export declare function findCryptoCurrencyByScheme(scheme: string): CryptoCurrency | null | undefined;
/**
 *
 * @param {*} ticker
 */
export declare function findCryptoCurrencyByTicker(ticker: string): CryptoCurrency | null | undefined;
/**
 *
 * @param {*} id
 */
export declare function findCryptoCurrencyById(id: string): CryptoCurrency | null | undefined;
/**
 *
 * @param {*} keyword
 */
export declare const findCryptoCurrencyByKeyword: (keyword: string) => CryptoCurrency | null | undefined;
/**
 *
 * @param {*} id
 */
export declare const hasCryptoCurrencyId: (id: string) => boolean;
/**
 *
 * @param {*} id
 */
export declare function getCryptoCurrencyById(id: string): CryptoCurrency;
export {};
//# sourceMappingURL=currencies.d.ts.map