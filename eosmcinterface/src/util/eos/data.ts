import { EOS_RPC } from ".";

export interface PlayerProps {
  owner: string;
  mc_username: string;
  confirmed: boolean;
  chest: any[];
  nft_chest: any[];
  stats: any[];
}

export const getPlayer = async (account: string): Promise<PlayerProps> => {
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

export interface AccountItemProps {
  global_id: number;
  category: string;
  token_name: string;
  amount: number;
}

export const getAccountItems = async (
  account: string
): Promise<AccountItemProps[]> => {
  const items = await EOS_RPC.get_table_rows({
    json: true,
    code: "eosminecraft",
    scope: account,
    table: "account",
    limit: 9999
  });
  return items.rows || [];
};
