import { Invocation, InvocationsSignerDetails, Signature } from '../types';
import { TypedData } from '../utils/typedData';
import { SignerInterface } from './interface';
export declare class LedgerBlindSigner implements SignerInterface {
  derivationPath: string;
  private transport;
  private getEthApp;
  getPubKey(): Promise<string>;
  signTransaction(
    transactions: Invocation[],
    transactionsDetail: InvocationsSignerDetails
  ): Promise<Signature>;
  signMessage(typedData: TypedData, accountAddress: string): Promise<Signature>;
  protected sign(msgHash: string): Promise<Signature>;
}
