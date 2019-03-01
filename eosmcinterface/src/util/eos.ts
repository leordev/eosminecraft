import { TextEncoder, TextDecoder } from "text-encoding";
import { Api, JsonRpc, RpcError } from "eosjs";
import JsSignatureProvider from "eosjs/dist/eosjs-jssig";
import nodeFetch from "node-fetch";
import { chainInfo, eosAccount } from "../settings";

const rpc = new JsonRpc(chainInfo.address, { fetch: nodeFetch });

const signatureProvider = new JsSignatureProvider([eosAccount.privateKey]);
const api = new Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

export const getChainInfo = async () => await rpc.get_info();

export const signTransaction = async (
  contract = "eosminecraft",
  action: string,
  data: any,
  authorization = eosAccount.authorization
) => {
  try {
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
  } catch (e) {
    console.error(`\nCaught exception: ${e}`);
    if (e instanceof RpcError) {
      console.error(JSON.stringify(e.json, null, 2));
    }
  }
};
