const fetch = require("node-fetch");
const fs = require("fs");
const config = require("./config.json");
const chalk = require("chalk");

var url =
    "https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values";

fetch(url)
    .then((res) => {
        console.info(chalk.grey("Successfully recieved response from MDN"));
        return res.text();
    })
    .then((body) => {
        var matches = Array.from(
            new Set(
                body
                    .match(/<code>"(.*)"<\/code>/g)
                    .map((s) => s.match(/<code>"(.*)"<\/code>/)[1])
                    .map((s) => {
                        let idx = s.indexOf(`"`);
                        if (idx != -1) s = s.substr(0, idx);
                        return s;
                    })
                    .filter((s) => s != "")
            )
        );

        console.info(
            chalk.grey(`Extracted ${matches.length} unique key names`)
        );

        var content = [
            "/*",
            " * File auto generated by getKeycodes.js",
            ` * Downloaded keycodes from ${url}`,
            " */",
            "export const KeyCodes = [",
            matches.map((s) => `\t"${s}"`).join(",\n"),
            "];",
            "",
            "export function KeyNumber(key: string) {",
            "\treturn KeyCodes.indexOf(key);",
            "};",
            "",
            "export function KeyName(key: number) {",
            "\treturn KeyCodes[key];",
            "};"
        ].join("\n");

        console.info(chalk.grey("Generated keycodes TypeScript file"));

        fs.writeFile(config.key_file, content, "utf-8", () => {
            console.info(
                chalk.green(`✓ Successfully updated ${config.key_file}`)
            );
        });
    })
    .catch((err) => {
        console.error(chalk.red("Error:"), err);
    });