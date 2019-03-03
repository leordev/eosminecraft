import { EOS_RPC } from ".";
import { Player, AccountItem } from "./interfaces";

export const getPlayer = async (account: string): Promise<Player> => {
  const players = await EOS_RPC.get_table_rows({
    json: true,
    code: "eosminecraft",
    scope: "eosminecraft",
    table: "player",
    lower_bound: account,
    limit: 1
  });
  const player = players.rows.find(entry => entry.owner === account);
  return player;
};

export const getAccountItems = async (
  account: string
): Promise<AccountItem[]> => {
  const items = await EOS_RPC.get_table_rows({
    json: true,
    code: "eosminecraft",
    scope: account,
    table: "account",
    limit: 9999
  });
  return items.rows || [];
};
