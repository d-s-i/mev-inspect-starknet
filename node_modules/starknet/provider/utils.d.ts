import type { BlockNumber } from '../types';
import { BigNumberish } from '../utils/number';
/**
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/fc97bdd8322a7df043c87c371634b26c15ed6cee/src/starkware/starknet/services/api/feeder_gateway/feeder_gateway_client.py#L148-L153)
 *
 * @param hashValue
 * @param hashField
 */
export declare function formatHash(hashValue: BigNumberish): string;
/**
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/fc97bdd8322a7df043c87c371634b26c15ed6cee/src/starkware/starknet/services/api/feeder_gateway/feeder_gateway_client.py#L156-L161)
 * @param txHash
 * @param txId
 */
export declare function txIdentifier(txHash?: BigNumberish, txId?: BigNumberish): string;
export declare type BlockIdentifier = BlockNumber | BigNumberish;
declare type BlockIdentifierObject =
  | {
      type: 'BLOCK_NUMBER';
      data: BlockNumber;
    }
  | {
      type: 'BLOCK_HASH';
      data: BigNumberish;
    };
/**
 * Identifies the block to be queried.
 *
 * @param blockIdentifier - block identifier
 * @returns block identifier object
 */
export declare function getBlockIdentifier(blockIdentifier: BlockIdentifier): BlockIdentifierObject;
/**
 * Gets the block identifier for API request
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/fc97bdd8322a7df043c87c371634b26c15ed6cee/src/starkware/starknet/services/api/feeder_gateway/feeder_gateway_client.py#L164-L173)
 *
 * @param blockIdentifier
 * @returns block identifier for API request
 */
export declare function getFormattedBlockIdentifier(blockIdentifier?: BlockIdentifier): string;
export {};
