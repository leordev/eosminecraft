package io.github.leordev.items;

public class TokenItem {
    public int srcItemId;
    public String srcItemName;
    public String eosCategory;
    public String eosTokenName;
    public boolean fungible = true;
    public boolean burnable = true;
    public boolean transferable = true;
    public long maxSupply = 999999999999L;

    private static final String DEFAULT_CATEGORY = "minecraft";

    public TokenItem(int id, String name) {
        this.srcItemId = id;
        this.srcItemName = name;
        this.eosCategory = DEFAULT_CATEGORY;
        this.eosTokenName = TokenHandler.tokenizeItemName(name);
    }
}
