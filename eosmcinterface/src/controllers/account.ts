import { EOS_RPC } from "../util/eos";
import { getPlayer } from "../util/eos/data";
import { signSimpleTransaction } from "../util/eos/transact";

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

export const getPlayerInfo = async (req, res, next) => {
  try {
    const { account } = req.params;
    if (!account) {
      throw new Error("You need to provide an account");
    }

    const player = await getPlayer(account);
    if (!player) {
      throw new Error("Player not found");
    }

    console.info("Sending player info", player);

    res.send(player);
  } catch (error) {
    next(error);
  }
};

export const postConfirmPlayer = async (req, res, next) => {
  try {
    const { account } = req.params;
    const { mcUsername } = req.body;
    if (!account || !mcUsername) {
      throw new Error("You need to provide an account and Minecraft username");
    }

    const player = await getPlayer(account);
    if (!player) {
      throw new Error("Player not found");
    }

    if (mcUsername !== player.mc_username) {
      throw new Error("Player not authorized");
    } else {
      const transaction = await signSimpleTransaction("acceptplayer", {
        owner: player.owner,
        mc_username: mcUsername
      });
      res.send({ success: true, transaction });
    }
  } catch (error) {
    next(error);
  }
};
