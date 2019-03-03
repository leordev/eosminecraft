import { JsonRpc, RpcError, Api } from "eosjs";
import JsSignatureProvider from "eosjs/dist/eosjs-jssig";
import nodeFetch from "node-fetch";
import { chainInfo, eosAccount } from "../../settings";
import { TextEncoder, TextDecoder } from "text-encoding";

export const EOS_RPC = new JsonRpc(chainInfo.address, { fetch: nodeFetch });

const signatureProvider = new JsSignatureProvider([eosAccount.privateKey]);
export const api = new Api({
  signatureProvider,
  rpc: EOS_RPC,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

export const defaultTransactionOptions = {
  blocksBehind: 3,
  expireSeconds: 30
};

export const isRpcError = err => err instanceof RpcError;

export const getChainInfo = async () => await EOS_RPC.get_info();
