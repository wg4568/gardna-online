import fs from "fs";
import { Compile } from "../lib/spritescript";

export default function LoadSprites(dirname: string): Map<string, Uint8Array> {
    console.log(`Loading sprites from '${dirname}'...`);
    var sprites = fs.readdirSync(dirname);
    var spriteData = new Map<string, Uint8Array>();

    sprites.forEach((sprite) => {
        var script = fs.readFileSync(dirname + "/" + sprite, "utf-8");
        var bytes = Compile(script);
        spriteData.set(sprite.replace(".ss", ""), bytes);
        console.log(`-> Compiled '${sprite}' to bytecode`);
    });

    return spriteData;
}
