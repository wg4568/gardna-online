import { Color } from "../lib/color";
import { Renderer } from "./renderer";
import { Connection } from "../common/connection";
import {
    KeyDownPacket,
    KeyUpPacket,
    MouseDownPacket,
    MouseMovePacket,
    MouseUpPacket
} from "../common/packets";
import { KeyNumber } from "../lib/keys";
import { inputHandler, spriteHandler } from "./handlers";
import { SpriteScript } from "../lib/spritescript";
import { AngleBetween } from "../lib/helpers";
import { Vector2 } from "../lib/vector";
import { InputState } from "../common/inputstate";
import config from "../../config.json";
import { Z_BEST_SPEED } from "zlib";

var url = `${config.wss ? "wss" : "ws"}://${config.host}:${config.port}`;

const socket = new Connection(new WebSocket(url));
const renderer = new Renderer("canvas", true);
const sprites = new Map<string, SpriteScript>();
const input = new InputState();

inputHandler(socket, input);
spriteHandler(socket, sprites);

SpriteScript.Debug = false;

var player_posn = Vector2.Empty();

export const background = Color.RandomPastel();
setInterval(() => {
    renderer.fill(background);

    var speed = 5;
    if (input.keyboard.get("KeyW")) player_posn.y -= speed;
    if (input.keyboard.get("KeyS")) player_posn.y += speed;
    if (input.keyboard.get("KeyA")) player_posn.x -= speed;
    if (input.keyboard.get("KeyD")) player_posn.x += speed;

    sprites
        .get("tank")
        ?.render(renderer.ctx, player_posn, [
            "william",
            AngleBetween(player_posn, input.cursor),
            255,
            0,
            0
        ]);
}, 1000 / config.client_fps);
