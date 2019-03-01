# Minecraft Assets on EOS Blockchain

Just an experiment... :)

## EOS MC Interface

Small express service to interface with Minecraft Java server

### Tests

```bash
# accepting and confirming player accounts
curl -H "Content-type: application/json" -d '{ "mcUsername": "sanorj" }' 'http://localhost:3000/player/sanorj111111/confirm' | jq


# deposit test
curl -X POST -H 'Content-Type: application/json' -d '{
    "items": [
        {"token_name": "acacia.boat", "quantity": 5 },
        {"token_name": "arrow", "quantity": 22 },
        {"token_name": "stone.axe", "quantity": 1 }
    ]
}' 'http://localhost:3000/player/sanorj111111/deposit' | jq
```

PS: Do yourself a favor and install `jq` (`brew install jq`)
