import { getSelectorFromName } from "starknet/utils/hash";

const HOUR_PER_DAY = 24;
const MIN_PER_HOUR = 60;
const MIN_PER_DAY = HOUR_PER_DAY * MIN_PER_HOUR;
const AVG_STARKNET_MIN_PER_BLOCK = 1.5; // 1min30s
export const STARKNET_BLOCKS_PER_DAY =  MIN_PER_DAY / AVG_STARKNET_MIN_PER_BLOCK;

export const callArrayStructLength = 4;

export const EXECUTE_SELECTOR = getSelectorFromName("__execute__");
export const TRANSFER_SELECTOR = getSelectorFromName("Transfer");
export const APPROVAL_SELECTOR = getSelectorFromName("Approval");
export const MINT_SELECTOR = getSelectorFromName("Mint");
export const BURN_SELECTOR = getSelectorFromName("Burn");
export const SYNC_SELECTOR = getSelectorFromName("Sync");
export const SWAP_SELECTOR = getSelectorFromName("Swap");