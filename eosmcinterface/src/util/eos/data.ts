import { EOS_RPC } from ".";

interface PlayerProps {
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
