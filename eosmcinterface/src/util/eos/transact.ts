import { TextEncoder, TextDecoder } from "text-encoding";
import { Api } from "eosjs";
import JsSignatureProvider from "eosjs/dist/eosjs-jssig";
import { eosAccount } from "../../settings";
import { EOS_RPC } from ".";

const signatureProvider = new JsSignatureProvider([eosAccount.privateKey]);
const api = new Api({
  signatureProvider,
  rpc: EOS_RPC,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

interface Authorization {
  actor: string;
  permission: string;
}

interface ActionData {
  authorization: Authorization[];
  account: string;
  name: string;
  data: any;
}

export const makeDefaultAction = (name: string, data: any): ActionData => ({
  name,
  data,
  account: "eosminecraft",
  authorization: eosAccount.authorization
});

export const defaultTransactionOptions = {
  blocksBehind: 3,
  expireSeconds: 30
};

export const signSimpleTransaction = async (name: string, data: any) => {
  return await signMultiTransaction([makeDefaultAction(name, data)]);
};

export const signMultiTransaction = async (actions: ActionData[]) => {
  console.info(`\n>>> Signing Transaction: ${JSON.stringify(actions)}`);
  const transaction = await api.transact(
    { actions },
    defaultTransactionOptions
  );
  const { id, block_num, block_time } = transaction.processed;
  console.info(
    `<<< Signed transaction: ${id} - BlockNum: ${block_num} @ ${block_time}\n`
  );
  return transaction;
};

export const issueItemAction = (
  to: string,
  token_name: string,
  quantity: number
) =>
  makeDefaultAction("issue", {
    to,
    token_name,
    quantity,
    action: "issue",
    category: "minecraft",
    metadata_uri: "",
    memo: "deposit"
  });

export const transferItemAction = (
  to: string,
  token_name: string,
  quantity: number
) =>
  makeDefaultAction("transfer", {
    to,
    token_name,
    quantity,
    from: eosAccount.accountName,
    category: "minecraft",
    memo: "deposit"
  });
