import { EOS_RPC } from "../util/eos";

export const getInfo = async (req, res, next) => {
  try {
    const { account } = req.params;
    if (!account) {
      throw new Error("You need to provide an account");
    }
    const accountData = await EOS_RPC.get_account(account);
    res.send(accountData);
  } catch (error) {
    next(error);
  }
};
