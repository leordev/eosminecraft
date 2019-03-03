import { eosAccount } from "../../settings";
import { ActionData, Deposit } from "./interfaces";
import { defaultTransactionOptions, api } from ".";

export const makeDefaultAction = (name: string, data: any): ActionData => ({
  name,
  data,
  account: "eosminecraft",
  authorization: eosAccount.authorization
});

export const signSimpleTransaction = async (name: string, data: any) => {
  return await signMultiTransaction([makeDefaultAction(name, data)]);
};

export const signMultiTransaction = async (actions: ActionData[]) => {
  logActions(actions);
  const transaction = await api.transact(
    { actions },
    defaultTransactionOptions
  );
  logTransaction(transaction);
  return transaction;
};

const logActions = (actions: ActionData[]) => {
  console.info(`\n>>> Signing Transaction: ${JSON.stringify(actions)}`);
};

const logTransaction = (transaction: any) => {
  const { id, block_num, block_time } = transaction.processed;
  console.info(
    `<<< Signed transaction: ${id} - BlockNum: ${block_num} @ ${block_time}\n`
  );
};

export const issueItemAction = ({ to, token_name, quantity, memo }: Deposit) =>
  makeDefaultAction("issue", {
    to,
    token_name,
    quantity,
    memo,
    action: "issue",
    category: "minecraft",
    metadata_uri: ""
  });

export const transferItemAction = ({
  to,
  token_name,
  quantity,
  memo
}: Deposit) =>
  makeDefaultAction("transfer", {
    to,
    token_name,
    quantity,
    memo,
    from: eosAccount.accountName,
    category: "minecraft"
  });
