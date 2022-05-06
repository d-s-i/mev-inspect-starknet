'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ContractFactory = void 0;
var minimalistic_assert_1 = __importDefault(require('minimalistic-assert'));
var provider_1 = require('../provider');
var default_1 = require('./default');
var ContractFactory = /** @class */ (function () {
  function ContractFactory(
    compiledContract,
    providerOrAccount,
    abi // abi can be different from the deployed contract ie for proxy contracts
  ) {
    if (providerOrAccount === void 0) {
      providerOrAccount = provider_1.defaultProvider;
    }
    if (abi === void 0) {
      abi = compiledContract.abi;
    }
    this.abi = abi;
    this.compiledContract = compiledContract;
    this.providerOrAccount = providerOrAccount;
  }
  /**
   * Deploys contract and returns new instance of the Contract
   *
   * @param constructorCalldata - Constructor Calldata
   * @param addressSalt (optional) - Address Salt for deployment
   * @returns deployed Contract
   */
  ContractFactory.prototype.deploy = function (constructorCalldata, addressSalt) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, address, code, transaction_hash, contractInstance;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.providerOrAccount.deployContract({
                contract: this.compiledContract,
                constructorCalldata: constructorCalldata,
                addressSalt: addressSalt,
              }),
            ];
          case 1:
            (_a = _b.sent()),
              (address = _a.address),
              (code = _a.code),
              (transaction_hash = _a.transaction_hash);
            (0,
            minimalistic_assert_1.default)(code === 'TRANSACTION_RECEIVED' && Boolean(address), 'Deployment of the contract failed');
            contractInstance = new default_1.Contract(
              this.compiledContract.abi,
              address,
              this.providerOrAccount
            );
            contractInstance.deployTransactionHash = transaction_hash;
            return [2 /*return*/, contractInstance];
        }
      });
    });
  };
  /**
   * Attaches to new Provider or Account
   *
   * @param providerOrAccount - new Provider or Account to attach to
   */
  ContractFactory.prototype.connect = function (providerOrAccount) {
    this.providerOrAccount = providerOrAccount;
    return this;
  };
  /**
   * Attaches current abi and provider or account to the new address
   *
   * @param address - Contract address
   * @returns Contract
   */
  ContractFactory.prototype.attach = function (address) {
    return new default_1.Contract(this.abi, address, this.providerOrAccount);
  };
  return ContractFactory;
})();
exports.ContractFactory = ContractFactory;
