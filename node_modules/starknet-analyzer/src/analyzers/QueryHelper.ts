import { BigNumber } from "ethers";
import { Provider } from "starknet";

export class QueryHelper {

    private _provider: Provider;
    private _tokens: { [tokenAddress: string]: { symbol: string, decimals: number } };
    private _pairs: { [lpTokenAddress: string]: { token0: string | undefined, token1: string | undefined } };
    private _factoriesAddresses: { [lpTokenAddress: string]: string };
    
    constructor(provider: Provider) {
        this._provider = provider;
        this._tokens = {};
        this._pairs = {};
        this._factoriesAddresses = {};
    }
    
    async query(contractAddress: string, entrypoint: string, calldata?: any[]) {
        try {
            return await this._query(contractAddress, entrypoint, calldata);
        } catch(error) {
            return undefined;
        }
    }

    async getFactoryAddr(lpTokenAddress: string) {
        if(this.factoriesAddresses[lpTokenAddress]) {
            return this.factoriesAddresses[lpTokenAddress];
        } else {
            let _factoryAddress = await this.query(lpTokenAddress, "getFactory");
            if(_factoryAddress !== undefined) {
                const factoryAddress = _factoryAddress[0];
                this.factoriesAddresses[lpTokenAddress] = factoryAddress;
               return factoryAddress;
            } else {
                return undefined;
            }
        }
    }

    async getSymbol(_tokenAddress: string) {
        const tokenAddress = BigNumber.from(_tokenAddress).toHexString();
        if(this.tokens[tokenAddress] && this.tokens[tokenAddress].symbol) {
            return this.tokens[tokenAddress].symbol;
        } else {
            const _symbol = await this.query(tokenAddress, "symbol");
            const symbol = _symbol ? _symbol[0] : undefined;
            if(!this.tokens[tokenAddress]) {
                this.tokens[tokenAddress] = { symbol: symbol || tokenAddress, decimals: 0 };
            } else {
                this.tokens[tokenAddress] = { symbol: symbol || tokenAddress, decimals: this.tokens[tokenAddress].decimals || 0 };
            }
            return symbol;
        }
    }

    async getToken0AndToken1(contractAddress: string) {
        if(this.pairs[contractAddress]) {
            return this.pairs[contractAddress];
        } else {
            try {
                const results = await Promise.all([
                    this.query(contractAddress, "token0"),
                    this.query(contractAddress, "token1"),
                ]);
                this.checkResultIsDefined(results);
                this.pairs[contractAddress] = { token0: results[0]![0], token1: results[1]![0] };
                return this.pairs[contractAddress];
            } catch(error) {
                this.pairs[contractAddress] = { token0: undefined, token1: undefined };
                return { token0: undefined, token1: undefined };
            }
        }
    }

    async getSymbolsAndDecimalsOfTokens(tokensAddresses: string[]) {

        let isAlreadyQueried: boolean[] = [];
        let queries = [];
        for(const addr of tokensAddresses) {
            if(this.tokens[addr]) {
                isAlreadyQueried.push(true);
                queries.push(this.tokens[addr].symbol, this.tokens[addr].decimals);
            }
        }

        if(!isAlreadyQueried.includes(false)) {
            return queries;
        }
        
        try {
            let promises: Promise<string[]>[] = [];
            for(const addr of tokensAddresses) {
                promises.push(this._query(addr, "symbol"));
                promises.push(this._query(addr, "decimals"));
            }
            const _results = await Promise.all(promises);
            const results = _results.map(res => res[0]);
            this.checkResultIsDefined(results);
            let iterations = 0;
            for(let i = 0; i < results.length; i = i + 2) {
                this.writeSymbolAndDecimals(tokensAddresses[iterations], { symbol: results[i], decimals: +results[i + 1] });
            }
            return results;
        } catch(error) {

            let tokensData = [];
            for(const addr of tokensAddresses) {
                tokensData.push(addr);
                tokensData.push(0);
                this.writeSymbolAndDecimals(addr, { symbol: addr, decimals: 0 });
            }
            return tokensData;
        }
    }

    writeSymbolAndDecimals(index: string, value: { symbol: string, decimals: number }) {
        this.tokens[index] = value;
    }

    checkResultIsDefined(results: any[]) {
        results.forEach((res, i) => {
            if(!res) throw new Error(
                `QueryHelper::checkResult - result at index ${i} is undefined (value of res[${i}]: ${res})`
            );
        });
    }
    
    async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    
    async _query(contractAddress: string, entrypoint: string, calldata?: any[]) {
        const { result: query } = await this.provider.callContract({
            contractAddress: contractAddress,
            entrypoint: entrypoint,
            calldata: calldata || []
        });
        return query;
    }

    get provider() {
        return this._provider;
    }

    get tokens() {
        return this._tokens;
    }

    get pairs() {
        return this._pairs;
    }

    get factoriesAddresses() {
        return this._factoriesAddresses;
    }
}