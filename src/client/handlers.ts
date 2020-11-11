import { Connection } from "../common/connection";
import {
    KeyDownPacket,
    KeyUpPacket,
    MouseDownPacket,
    MouseUpPacket,
    MouseMovePacket,
    SpritePacket
} from "../common/packets";
import { KeyNumber } from "../lib/keys";
import config from "../../config.json";
import { fromUint8Array } from "js-base64";
import { SpriteScript } from "../lib/spritescript";
import { InputState } from "../common/inputstate";
import { Vector2 } from "../lib/vector";

export function inputHandler(socket: Connection, input: InputState) {
    document.onkeydown = (e) => {
        input.recordKeyDown(e.code);
        socket.send(KeyDownPacket, [KeyNumber(e.code)]);
    };

    document.onkeyup = (e) => {
        input.recordKeyUp(e.code);
        socket.send(KeyUpPacket, [KeyNumber(e.code)]);
    };

    document.onmousedown = (e) => {
        input.recordMouseDown(e.button);
        input.recordMouseMove(new Vector2(e.clientX, e.clientY));
        socket.send(MouseDownPacket, [e.button, e.clientX, e.clientY]);
    };

    document.onmouseup = (e) => {
        input.recordMouseUp(e.button);
        input.recordMouseMove(new Vector2(e.clientX, e.clientY));
        socket.send(MouseUpPacket, [e.button, e.clientX, e.clientY]);
    };

    var lastUpdate = Date.now();
    document.onmousemove = (e) => {
        input.recordMouseMove(new Vector2(e.clientX, e.clientY));
        if (Date.now() - lastUpdate > 1000 / config.server_tps) {
            socket.send(MouseMovePacket, [e.clientX, e.clientY]);
            lastUpdate = Date.now();
        }
    };
}

export function spriteHandler(
    socket: Connection,
    sprites: Map<string, SpriteScript>
) {
    socket.listen(SpritePacket, ([name, script]) => {
        console.log(`Recieved spritescript for ${name}`);
        sprites.set(name as string, new SpriteScript(script as Uint8Array));
    });
}
