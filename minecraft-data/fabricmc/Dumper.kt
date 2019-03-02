package pswanson.eoscraft.items

import net.minecraft.util.registry.Registry
import java.io.File

data class DumpRow(val catSrc: String,
                   val itemSrc: String,
                   val category: String,
                   val token: String,
                   val fungible: Boolean,
                   val burnable: Boolean,
                   val transferable: Boolean,
                   val maxSupply: Long) {
    override fun toString(): String {
        return "$catSrc,$itemSrc,$category,$token,$fungible,$burnable,$transferable,$maxSupply"
    }
}

fun dump() {
    val items = Registry.ITEM.ids

    val rows = items.map {
        DumpRow(it.namespace, it.path, sanitize(it.namespace), sanitize(it.path), true, true, true,999_999_999_999)
    }.sortedBy { it.category + "." + it.token }
            .fold(listOf<DumpRow>()) { acc, element ->
                acc + deduplicatedElement(element, acc)
            }

    val header = "cat_src,item_src,category,token_name,fungible,burnable,transferable,max_supply\n"
    val res = header + rows.joinToString("\n")
    save(res)

    saveCleos(rows)
}

fun sanitize(dirty: String): String {
    val re = Regex("0|[6-9]")

    val clean = dirty.replace(re,"1").replace("_", ".")

    val res = if (clean.length > 12) {
        val words = clean.split(".")
        words.mapIndexed { index, s ->
            if (index > 0) {
                val end = if (s.length > 3 && index < words.size-1) 3 else s.length
                s.substring(0, end)
            } else s
        }.joinToString(".")
    } else clean

    val end = if (res.length > 12) 12 else res.length

    val unperiodRes = if (end == 12 && res[11] == '.') {
        var p = res
        while(p[11] == '.') {
            p = if (p.length > 12) p.substring(0, 11) + p[12] else p.substring(0,11) + "1"
        }
        p
    } else res

    return unperiodRes.substring(0, end)
}

fun deduplicatedElement(element: DumpRow, list: List<DumpRow>) : DumpRow {
    var el = element.copy()

    var i = 1
    while(list.any { it.category == el.category && it.token == el.token }  ) {
        println("Found duplicated: ${el.token}")
        el = el.copy(token = element.token.dropLast(i.toString().length) + i)

        // only 1-5 allowed, hoping it does not have 25+ dups
        if (i % 5 == 0) i += 6 else i++
    }

    return el
}

fun save(content: String) {
    val fileName = "eos-dump.txt"
    val file = File(fileName)

    file.printWriter().use { out ->
        out.print(content)
    }

    println("EOS File Dumped Successfully")
}

fun saveCleos(rows: List<DumpRow>) {
    val fileName = "eos-dump-cleos.sh"
    val file = File(fileName)

    val commands = "set -e\nCLEOS=\"cleos -u http://jungle2.cryptolions.io:80 \"\n" +
        rows.map{
        "\$CLEOS push action eosminecraft create '[\"eosminecraft\", \"${it.category}\", \"${it.token}\", ${it.fungible}, ${it.burnable}, ${it.transferable}, ${it.maxSupply}]' -p eosminecraft"
    }.joinToString("\n")

    file.printWriter().use { out ->
        out.print(commands)
    }

    println("EOS Cleos command Dumped Successfully")
}
