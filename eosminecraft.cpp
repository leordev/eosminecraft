#include <eosiolib/eosio.hpp>
#include <eosiolib/singleton.hpp>
#include <eosiolib/asset.hpp>
#include <string>

using namespace eosio;
using std::string;
using std::vector;

CONTRACT eosminecraft : public eosio::contract
{
public:
  using contract::contract;

  eosminecraft(name receiver, name code, datastream<const char *> ds)
      : contract(receiver, code, ds),
        _symbolinfo(receiver, receiver.value),
        _tokeninfos(receiver, receiver.value),
        _categoryinfos(receiver, receiver.value)
  {
  }

  /***
   * Symbol Info Table
   * Singleton  which  holds  the  symbol  for  the  contract  and  is 
   * set  the  first  call  of create.global_id is incremented each time 
   * create is successfully called
   * 
   * scope: self
   **/
  TABLE symbolinfo
  {
    uint64_t global_id = 0;
  };

  /***
   * Category Table
   * Holds all category names for easy querying.
   * 
   * scope: self
   **/
  TABLE categoryinfo
  {
    name category;
    uint64_t primary_key() const { return category.value; }
  };

  /***
   * Token Stats Table
   * Ensures there can be only one category, token_name pair.  Stores 
   * whether a given token is fungible  or  burnable  and  what  the  
   * current  and  max  supplies  are. Info  is  written  when a token 
   * is created.
   * 
   * scope: category 
   **/
  TABLE tokenstats
  {
    name token_name;
    uint64_t global_id;
    name issuer;
    bool fungible;
    bool burnable;
    bool transferable;
    double current_supply;
    uint64_t max_supply;

    uint64_t primary_key() const { return token_name.value; }
  };

  /***
   * Token Info Table
   * This is the global list of non or semi-fungible tokens. 
   * Secondary indices provide search by owner, category, or 
   * tokenname.
   * 
   * scope: self
   **/
  TABLE tokeninfo
  {
    uint64_t id;
    uint64_t global_id;
    name owner;
    name category;
    name token_name;
    uint64_t serial_number;
    string metadata_uri;

    uint64_t primary_key() const { return id; }
    uint64_t get_owner() const { return owner.value; }
  };

  /***
   * Account Table
   * The Account table holds the fungible tokens for an account,
   * and a reference to how many NFTs that account owns of a given type.
   * 
   * scope: owner
   **/
  TABLE account
  {
    uint64_t global_id;
    name category;
    name token_name;
    double amount;

    uint64_t primary_key() const { return global_id; }
  };

  /*** Table definitions ***/
  typedef eosio::multi_index<"tokenstats"_n, tokenstats> tokenstatss;
  typedef eosio::multi_index<"account"_n, account> accounts;

  // self-scoped
  typedef eosio::singleton<"symbolinfo"_n, symbolinfo> symbolinfo_sg;
  symbolinfo_sg _symbolinfo;
  typedef eosio::multi_index<"categoryinfo"_n, categoryinfo> categoryinfos;
  categoryinfos _categoryinfos;
  typedef eosio::multi_index<"tokeninfo"_n, tokeninfo> tokeninfos;
  tokeninfos _tokeninfos;

  /*** Config Accessors ***/
  symbolinfo _get_symbolinfo()
  {
    symbolinfo si;

    if (_symbolinfo.exists())
    {
      si = _symbolinfo.get();
    }
    else
    {
      si = symbolinfo{};
      _symbolinfo.set(si, _self);
    }

    return si;
  };

  uint64_t _next_id()
  {
    auto si = _get_symbolinfo();
    si.global_id++;
    check(si.global_id > 0, "global_id overflow detected");
    _update_symbolinfo(si);
    return si.global_id;
  };

  void _update_symbolinfo(const symbolinfo &si) { _symbolinfo.set(si, _self); }

  /*** Helpers ***/
  void _check_and_add_category(name category)
  {
    auto cat = _categoryinfos.find(category.value);
    if (cat == _categoryinfos.end())
    {
      _categoryinfos.emplace(_self, [&](auto &r) {
        r.category = category;
      });
    }
  }

  void _sub_balance(name owner, uint64_t global_id, double quantity)
  {
    accounts from_acnts(_self, owner.value);

    const auto &from = from_acnts.get(global_id, "no balance object found");
    eosio_assert(from.amount >= quantity, "overdrawn balance");

    from_acnts.modify(from, owner, [&](auto &r) {
      r.amount -= quantity;
    });
  }

  void _add_balance(name owner, uint64_t global_id, name category, name token_name, double quantity, name ram_payer)
  {
    accounts to_acnts(_self, owner.value);
    auto to = to_acnts.find(global_id);
    if (to == to_acnts.end())
    {
      to_acnts.emplace(ram_payer, [&](auto &r) {
        r.global_id = global_id;
        r.token_name = token_name;
        r.category = category;
        r.amount = quantity;
      });
    }
    else
    {
      to_acnts.modify(to, same_payer, [&](auto &r) {
        r.amount += quantity;
      });
    }
  }

  /*** Contract Actions ***/

  ACTION reset(name category)
  {
    // debug reset data
    require_auth(_self);

    auto si = _get_symbolinfo();
    si.global_id = 0;
    _update_symbolinfo(si);

    tokenstatss _stats(_self, category.value);
    auto itr = _stats.begin();
    while (itr != _stats.end())
    {
      itr = _stats.erase(itr);
    }
  }

  ACTION create(name issuer, name category, name token_name, bool fungible, bool burnable, bool transferable, int64_t max_supply)
  {
    require_auth(_self);

    check(max_supply > 0, "max-supply must be positive");

    tokenstatss _stats(_self, category.value);
    auto token = _stats.find(token_name.value);
    check(token == _stats.end(), "token already exists");

    _check_and_add_category(category);

    _stats.emplace(_self, [&](auto &r) {
      r.token_name = token_name;
      r.global_id = _next_id();
      r.issuer = issuer;
      r.fungible = fungible;
      r.burnable = burnable;
      r.transferable = transferable;
      r.current_supply = 0;
      r.max_supply = max_supply;
    });
  }

  ACTION issue(name to, name category, name token_name, double quantity, string metadata_uri, string memo)
  {
    check(quantity > 0, "must issue positive quantity");
    check(memo.size() <= 256, "memo has more than 256 bytes");

    tokenstatss _stats(_self, category.value);
    auto itr_token = _stats.find(token_name.value);
    check(itr_token != _stats.end(), "token does not exist");

    const auto &token = *itr_token;

    require_auth(token.issuer);
    check(quantity <= token.max_supply - token.current_supply, "quantity exceeds available supply");

    _stats.modify(itr_token, same_payer, [&](auto &r) {
      r.current_supply += quantity;
    });

    _add_balance(token.issuer, token.global_id, category, token_name, quantity, token.issuer);

    if (to != token.issuer)
    {
      SEND_INLINE_ACTION(*this, transfer, {{token.issuer, "active"_n}},
                         {token.issuer, to, category, token_name, quantity, memo});
    }
  }

  ACTION transfer(name from, name to, name category, name token_name, double quantity, string memo)
  {
    check(from != to, "cannot transfer to self");
    check(quantity > 0, "must transfer positive quantity");
    check(memo.size() <= 256, "memo has more than 256 bytes");

    require_auth(from);
    check(is_account(to), "to account does not exist");

    tokenstatss _stats(_self, category.value);
    auto itr_token = _stats.find(token_name.value);
    check(itr_token != _stats.end(), "token does not exist");

    const auto &token = *itr_token;

    require_recipient(from);
    require_recipient(to);

    auto payer = has_auth(to) ? to : from;

    _sub_balance(from, token.global_id, quantity);
    _add_balance(to, token.global_id, category, token_name, quantity, payer);
  }

  ACTION pausexfer(bool pause) {}

  ACTION burnnft(name owner, vector<uint64_t> tokeninfo_ids) {}

  ACTION burn(name owner, uint64_t global_id, double quantity) {}

  ACTION transfernft(name from, name to, vector<uint64_t> tokeninfo_ids, string memo) {}
};

EOSIO_DISPATCH(eosminecraft, (reset)(create)(issue)(pausexfer)(burnnft)(burn)(transfernft)(transfer))