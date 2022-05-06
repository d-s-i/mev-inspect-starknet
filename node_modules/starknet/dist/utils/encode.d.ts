export declare const IS_BROWSER: boolean;
export declare function arrayBufferToString(array: ArrayBuffer): string;
export declare function btoaUniversal(b: ArrayBuffer): string;
export declare function buf2hex(buffer: Uint8Array): string;
/**
 * Some function imported from https://github.com/pedrouid/enc-utils/blob/master/src/index.ts
 * enc-utils is no dependency to avoid using `Buffer` which just works in node and no browsers
 */
export declare function removeHexPrefix(hex: string): string;
export declare function addHexPrefix(hex: string): string;
export declare function padLeft(str: string, length: number, padding?: string): string;
export declare function calcByteLength(length: number, byteSize?: number): number;
export declare function sanitizeBytes(str: string, byteSize?: number, padding?: string): string;
export declare function sanitizeHex(hex: string): string;
export declare function utf8ToArray(str: string): Uint8Array;
