export interface Authorization {
  actor: string;
  permission: string;
}

export interface ActionData {
  authorization: Authorization[];
  account: string;
  name: string;
  data: any;
}

export interface AccountItem {
  global_id: number;
  category: string;
  token_name: string;
  amount: number;
}

export interface Deposit {
  to: string;
  token_name: string;
  quantity: number;
  memo: string;
}

export interface Player {
  owner: string;
  mc_username: string;
  confirmed: boolean;
  chest: any[];
  nft_chest: any[];
  stats: any[];
}
