import { getSelectorFromName } from "starknet/utils/stark";

const HOUR_PER_DAY = 24;
const MIN_PER_HOUR = 60;
const MIN_PER_DAY = HOUR_PER_DAY * MIN_PER_HOUR;
const AVG_STARKNET_MIN_PER_BLOCK = 1.5; // 1min30s
export const STARKNET_BLOCKS_PER_DAY =  MIN_PER_DAY / AVG_STARKNET_MIN_PER_BLOCK;

export const EXECUTE_SELECTOR = getSelectorFromName("__execute__");