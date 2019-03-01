import { EOS_PRIVATE_KEY } from "./util/secrets";

const eosAccount = {
  accountName: "eosminecraft",
  publicKey: "EOS8KritzjsupZ6XpD5CDZ8G8cfX4iUyiuQfwZwzYgd5xioq83CbB",
  privateKey: EOS_PRIVATE_KEY,
  authorization: [
    {
      actor: "eosminecraft",
      permission: "active"
    }
  ]
};

const chainInfo = {
  address: "http://jungle2.cryptolions.io"
};

export { eosAccount, chainInfo };
