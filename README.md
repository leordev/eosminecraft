# Minecraft Assets on EOS Blockchain

Just an experiment... :)

## EOS MC Interface

Small express service to interface with Minecraft Java server

### Tests

```bash
# accepting and confirming player accounts
curl -H "Content-type: application/json" -d '{ "mcUsername": "sanorj" }' 'http://localhost:5000/player/sanorj111111/confirm' | jq


# deposit test (simulates minecraft ui)
curl -X POST -H 'Content-Type: application/json' -d '{
    "items": [
        {"token_name": "boat.acacia", "quantity": 5, "memo": "0;100;200;300" },
        {"token_name": "arrow", "quantity": 22, "memo": "0;100;200;300" },
        {"token_name": "stone.axe", "quantity": 1, "memo": "0;100;200;300" }
    ]
}' 'http://localhost:5000/player/sanorj111111/deposit' | jq


# withdraw test
# part 1: transfer your items back to the game contract
cleos push action eosminecraft transfer '["sanorj111111", "eosminecraft", "minecraft", "arrow", 10, "giving back to the world"]' -p sanorj111111
cleos push action eosminecraft transfer '["sanorj111111", "eosminecraft", "minecraft", "boat.acacia", 3, "giving back to the world"]' -p sanorj111111

# part 2: execute the withdraw (simulates minecraft ui)
curl -X POST -H 'Content-Type: application/json' -d '{
    "items": [
        {"token_name": "arrow", "quantity": 10, "memo": "1;100;200;300" },
        {"token_name": "boat.acacia", "quantity": 3, "memo": "1;100;200;300" }
    ]
}' 'http://localhost:5000/player/sanorj111111/withdraw' | jq
```

PS: Do yourself a favor and install `jq` (`brew install jq`)

## Minecraft Misc

- minecraft-data folder has a kotlin dumper for FabricMC and Java dumper for SpigotMC
- eos-items.csv were generated from SpigotMC
- update the chain url you want to use and execute `./cleos-items.sh` to load Minecraft items after deployment

```

```
