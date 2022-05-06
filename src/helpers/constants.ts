import { getSelectorFromName } from "starknet/utils/hash";

export const callArrayStructLength = 4;

export const EXECUTE_SELECTOR = getSelectorFromName("__execute__");
export const TRANSFER_SELECTOR = getSelectorFromName("Transfer");
export const APPROVAL_SELECTOR = getSelectorFromName("Approval");
export const MINT_SELECTOR = getSelectorFromName("Mint");
export const BURN_SELECTOR = getSelectorFromName("Burn");
export const SYNC_SELECTOR = getSelectorFromName("Sync");
export const SWAP_SELECTOR = getSelectorFromName("Swap");

export const ALPHA_ROAD_FACTORY = "0x373c71f077b96cbe7a57225cd503d29cadb0056ed741a058094234d82de2f9";
export const MYSWAP_ROUTER_ADDRESS = "0x71faa7d6c3ddb081395574c5a6904f4458ff648b66e2123b877555d9ae0260e";
export const ALPHAROAD_ROUTER_ADDRESS = "0x4aec73f0611a9be0524e7ef21ab1679bdf9c97dc7d72614f15373d431226b6a";
export const MESH_ROUTER_ADDRESS = "0x01ea2f12a70ad6a052f99a49dace349996a8e968a0d6d4e9ec34e0991e6d5e5e";