# Minecraft Assets on EOS Blockchain

Just an experiment... :)

## EOS MC Interface

Small express service to interface with Minecraft Java server

### Tests

```bash
# accepting and confirming player accounts
curl -H "Content-type: application/json" -d '{ "mcUsername": "sanorj" }' 'http://localhost:3000/player/sanorj111111/confirm'
```
