import { getAccountItems } from "../util/eos/data";
import { eosAccount } from "../settings";
import flat from "array.prototype.flat";
import {
  transferItemAction,
  issueItemAction,
  signMultiTransaction
} from "../util/eos/transact";
import { AccountItem, Deposit } from "../util/eos/interfaces";

const calcAndTransferActions = (serverItem: AccountItem, item, to: string) => {
  const actions = [] as any[];
  const balanceDiff = serverItem.amount - item.quantity;
  const transferAmount = balanceDiff >= 0 ? item.quantity : serverItem.amount;

  if (serverItem.amount > 0) {
    const deposit: Deposit = {
      to,
      token_name: item.token_name,
      quantity: transferAmount,
      memo: item.memo
    };
    actions.push(transferItemAction(deposit));
  }

  if (balanceDiff < 0) {
    const deposit: Deposit = {
      to,
      token_name: item.token_name,
      quantity: balanceDiff * -1,
      memo: item.memo
    };
    actions.push(issueItemAction(deposit));
  }

  return actions;
};

const calculateActions = (
  playerAccount: string,
  playerDepositBatch: any[],
  serverItems: any[]
) => {
  const actions = [] as any[];
  for (const item of playerDepositBatch) {
    const serverItem = serverItems.find(
      entry => entry.token_name === item.token_name
    );

    if (!serverItem) {
      const deposit: Deposit = {
        to: playerAccount,
        token_name: item.token_name,
        quantity: item.quantity,
        memo: item.memo
      };
      actions.push(issueItemAction(deposit));
    } else {
      actions.push(calcAndTransferActions(serverItem, item, playerAccount));
    }
  }

  return flat(actions);
};

export const postDeposit = async (req, res, next) => {
  try {
    const { account } = req.params;
    const { items } = req.body;

    if (!account || !items) throw new Error("Invalid account or items list");

    const serverItems = await getAccountItems(eosAccount.accountName);
    const actions = calculateActions(account, items, serverItems);
    const transaction = await signMultiTransaction(actions);
    res.send({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};
