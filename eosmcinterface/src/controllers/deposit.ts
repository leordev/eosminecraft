import { getAccountItems, AccountItemProps } from "../util/eos/data";
import { eosAccount } from "../settings";
import flat from "array.prototype.flat";

const issueItemAction = (to: string, token_name: string, quantity: number) => ({
  to,
  token_name,
  quantity,
  category: "minecraft",
  metadata_uri: "",
  memo: "deposit"
});

const transferItemAction = (
  to: string,
  token_name: string,
  quantity: number
) => ({
  to,
  token_name,
  quantity,
  from: eosAccount.accountName,
  category: "minecraft",
  memo: "deposit"
});

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

    console.info(account, items);
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

    res.send(flat(actions));
  } catch (error) {
    next(error);
  }
};
