import { TextEncoder, TextDecoder } from "text-encoding";
import { Api, JsonRpc, RpcError } from "eosjs";
import JsSignatureProvider from "eosjs/dist/eosjs-jssig";
import nodeFetch from "node-fetch";
import { chainInfo, eosAccount } from "../../settings";

export const EOS_RPC = new JsonRpc(chainInfo.address, { fetch: nodeFetch });

const signatureProvider = new JsSignatureProvider([eosAccount.privateKey]);
const api = new Api({
  signatureProvider,
  rpc: EOS_RPC,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

export const isRpcError = err => err instanceof RpcError;

export const getChainInfo = async () => await EOS_RPC.get_info();

export const signTransaction = async (
  action: string,
  data: any,
  contract = "eosminecraft",
  authorization = eosAccount.authorization
) => {
  return await api.transact(
    {
      actions: [
        {
          authorization,
          data,
          account: contract,
          name: action
        }
      ]
    },
    {
      blocksBehind: 3,
      expireSeconds: 30
    }
  );
};
