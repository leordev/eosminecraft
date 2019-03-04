import { issueItemAction, signMultiTransaction } from "../util/eos/transact";
import { Deposit } from "../util/eos/interfaces";

export const postDeposit = async (req, res, next) => {
  try {
    const { account } = req.params;
    const { items } = req.body;

    if (!account || !items) throw new Error("Invalid account or items list");

    const actions = makeActions(account, items);
    const transaction = await signMultiTransaction(actions);
    res.send({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

const makeActions = (playerAccount: string, playerDepositBatch: any[]) => {
  const actions = [] as any[];
  for (const item of playerDepositBatch) {
    const deposit: Deposit = {
      to: playerAccount,
      token_name: item.token_name,
      quantity: item.quantity,
      memo: item.memo
    };
    actions.push(issueItemAction(deposit));
  }

  return actions;
};
