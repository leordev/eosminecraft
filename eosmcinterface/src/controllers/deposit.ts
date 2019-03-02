import { getAccountItems, AccountItemProps } from "../util/eos/data";
import { eosAccount } from "../settings";
import flat from "array.prototype.flat";
import {
  transferItemAction,
  issueItemAction,
  signMultiTransaction
} from "../util/eos/transact";

const calcAndTransferActions = (
  serverItem: AccountItemProps,
  item,
  to: string
) => {
  const actions = [] as any[];
  const balanceDiff = serverItem.amount - item.quantity;
  const transferAmount = balanceDiff >= 0 ? item.quantity : serverItem.amount;

  if (serverItem.amount > 0) {
    actions.push(transferItemAction(to, item.token_name, transferAmount));
  }

  if (balanceDiff < 0) {
    actions.push(issueItemAction(to, item.token_name, balanceDiff * -1));
  }

  return actions;
};

export const postDeposit = async (req, res, next) => {
  try {
    const { account } = req.params;
    const { items } = req.body;

    if (!account || !items) throw new Error("Invalid account or items list");

    const serverItems = await getAccountItems(eosAccount.accountName);

    const actions = [] as any[];
    for (const item of items) {
      const serverItem = serverItems.find(
        entry => entry.token_name === item.token_name
      );

      if (!serverItem) {
        actions.push(issueItemAction(account, item.token_name, item.quantity));
      } else {
        actions.push(calcAndTransferActions(serverItem, item, account));
      }
    }

    const flatActions = flat(actions);
    const transaction = await signMultiTransaction(flatActions);

    res.send({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};
