import { AccountInterface } from '../account';
import { ProviderInterface } from '../provider';
import { BlockIdentifier } from '../provider/utils';
import {
  Abi,
  AddTransactionResponse,
  AsyncContractFunction,
  ContractFunction,
  Invocation,
  Overrides,
  Result,
} from '../types';
export declare abstract class ContractInterface {
  abstract abi: Abi;
  abstract address: string;
  abstract providerOrAccount: ProviderInterface | AccountInterface;
  abstract deployTransactionHash?: string;
  readonly functions: {
    [name: string]: AsyncContractFunction;
  };
  readonly callStatic: {
    [name: string]: AsyncContractFunction;
  };
  readonly populateTransaction: {
    [name: string]: ContractFunction;
  };
  readonly estimateFee: {
    [name: string]: ContractFunction;
  };
  readonly [key: string]: AsyncContractFunction | any;
  /**
   * Saves the address of the contract deployed on network that will be used for interaction
   *
   * @param address - address of the contract
   */
  abstract attach(address: string): void;
  /**
   * Attaches to new Provider or Account
   *
   * @param providerOrAccount - new Provider or Account to attach to
   */
  abstract connect(providerOrAccount: ProviderInterface | AccountInterface): void;
  /**
   * Resolves when contract is deployed on the network or when no deployment transaction is found
   *
   * @returns Promise that resolves when contract is deployed on the network or when no deployment transaction is found
   * @throws When deployment fails
   */
  abstract deployed(): Promise<ContractInterface>;
  /**
   * Calls a method on a contract
   *
   * @param method name of the method
   * @param args Array of the arguments for the call
   * @returns Result of the call as an array with key value pars
   */
  abstract call(
    method: string,
    args?: Array<any>,
    options?: {
      blockIdentifier?: BlockIdentifier;
    }
  ): Promise<Result>;
  /**
   * Invokes a method on a contract
   *
   * @param method name of the method
   * @param args Array of the arguments for the invoke
   * @returns Add Transaction Response
   */
  abstract invoke(
    method: string,
    args?: Array<any>,
    options?: Overrides
  ): Promise<AddTransactionResponse>;
  /**
   * Calls a method on a contract
   *
   * @param method name of the method
   * @param args Array of the arguments for the call
   */
  abstract estimate(
    method: string,
    args?: Array<any>,
    options?: {
      blockIdentifier?: BlockIdentifier;
    }
  ): Promise<any>;
  /**
   * Calls a method on a contract
   *
   * @param method name of the method
   * @param args Array of the arguments for the call
   * @returns Invocation objet
   */
  abstract populate(method: string, args?: Array<any>): Invocation;
}
