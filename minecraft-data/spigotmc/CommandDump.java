package io.github.leordev.commands;

import io.github.leordev.config.EosConfig;
import io.github.leordev.items.TokenItem;
import org.bukkit.Material;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.ConsoleCommandSender;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintStream;

import static io.github.leordev.EosMcPlugin.DATA_FOLDER;
import static io.github.leordev.EosMcPlugin.LOGGER;

public class CommandDump implements CommandExecutor {

    private static final String HEADER_CSV = "src_id,src_name,category,token_name,fungible,burnable,transferable,max_supply";

    public boolean onCommand(CommandSender commandSender, Command command, String s, String[] strings) {
        if (!(commandSender instanceof ConsoleCommandSender)) {
            return false;
        }

        dumpCsv();
        dumpCleos();

        return true;
    }

    private void dumpCsv() {
        String filePath = DATA_FOLDER.getAbsolutePath() + File.separator + "eos-items.csv";
        try (PrintStream out = new PrintStream(filePath)) {
            out.println(HEADER_CSV);
            int count = printItems(out);
            LOGGER.info("Dumped " + count + " items.");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
    }

    private int printItems(PrintStream out) {
        int count = 0;
        for (Material material : Material.values()) {
            if (!material.isItem()) continue;
            TokenItem item = new TokenItem(material.getId(), material.name());
            String itemLine = dumpTokenCsv(item);
            out.println(itemLine);
            count++;
        }
        return count;
    }

    private String dumpTokenCsv(TokenItem item) {
        return String.join(",",
                String.valueOf(item.srcItemId),
                item.srcItemName,
                item.eosCategory,
                item.eosTokenName,
                String.valueOf(item.fungible),
                String.valueOf(item.burnable),
                String.valueOf(item.transferable),
                String.valueOf(item.maxSupply));
    }

    private void dumpCleos() {
        String filePath = DATA_FOLDER.getAbsolutePath() + File.separator + "cleos-items.sh";
        try (PrintStream out = new PrintStream(filePath)) {
            out.println("set -e\nCLEOS=\"cleos -u http://localhost:8888 \"\n");
            printCleosItems(out);
            LOGGER.info("Dumped cleos items script.");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
    }

    private void printCleosItems(PrintStream out) {
        for (Material material : Material.values()) {
            if (!material.isItem()) continue;
            TokenItem item = new TokenItem(material.getId(), material.name());
            String itemCmd = dumpTokenCleos(item);
            out.println(itemCmd);
        }
    }

    private String dumpTokenCleos(TokenItem item) {
        String account = EosConfig.getAccount();
        return "$CLEOS push action "
                + account
                + " create '[\"" + account
                + "\", \"" + item.eosCategory
                + "\", \"" + item.eosTokenName
                + "\", " + item.fungible
                + ", " + item.burnable
                + ", " + item.transferable
                + ", " + item.maxSupply
                + "]' -p " + account;
    }
}
