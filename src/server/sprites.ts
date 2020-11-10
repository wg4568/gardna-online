import fs from "fs";
import { Compile } from "../lib/spritescript";

export default function LoadSprites(
    dirname: string
): { [key: string]: Uint8Array } {
    console.log(`Loading sprites from '${dirname}'...`);
    var sprites = fs.readdirSync(dirname);
    var spriteData: { [key: string]: Uint8Array } = {};

    sprites.forEach((sprite) => {
        var script = fs.readFileSync(dirname + "/" + sprite, "utf-8");
        var bytes = Compile(script);
        spriteData[sprite.replace(".ss", "")] = bytes;
        console.log(`-> Compiled '${sprite}' to bytecode`);
    });

    return spriteData;
}
