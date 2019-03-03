import { signMultiTransaction, withdrawItemAction } from "../util/eos/transact";
import { Withdraw } from "../util/eos/interfaces";

export const postWithdraw = async (req, res, next) => {
  try {
    const { account } = req.params;
    const { items } = req.body;

    if (!account || !items) throw new Error("Invalid account or items list");

    const actions = makeWithdrawActions(account, items);
    const transaction = await signMultiTransaction(actions);
    res.send({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

const makeWithdrawActions = (
  playerAccount: string,
  playerWithdrawBatch: any[]
) => {
  const actions = [] as any[];
  for (const item of playerWithdrawBatch) {
    const withdraw: Withdraw = {
      owner: playerAccount,
      token_name: item.token_name,
      quantity: item.quantity,
      memo: item.memo
    };
    actions.push(withdrawItemAction(withdraw));
  }

  return actions;
};
