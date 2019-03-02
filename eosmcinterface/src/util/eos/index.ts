import { JsonRpc, RpcError } from "eosjs";
import nodeFetch from "node-fetch";
import { chainInfo } from "../../settings";

export const EOS_RPC = new JsonRpc(chainInfo.address, { fetch: nodeFetch });

export const isRpcError = err => err instanceof RpcError;

export const getChainInfo = async () => await EOS_RPC.get_info();
