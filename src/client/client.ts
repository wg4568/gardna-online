import { Color } from "../lib/color";
import { Renderer } from "./renderer";
import { Connection } from "../common/connection";
import {
    DisconnectPacket,
    OnboardPacket,
    ParsePacket,
    PlayerPacket,
    PlayersPacket
} from "../common/packets";
import { inputHandler, spriteHandler } from "./handlers";
import { SpriteScript } from "../lib/spritescript";
import { AngleBetween } from "../lib/helpers";
import { Vector2 } from "../lib/vector";
import { InputState } from "../common/inputstate";
import config from "../../config.json";

var url = `${config.wss ? "wss" : "ws"}://${config.host}:${config.port}`;

export const socket = new Connection(new WebSocket(url));
export const renderer = new Renderer("canvas", true);
export const sprites = new Map<string, SpriteScript>();
export const input = new InputState();
export const background = Color.RandomPastel();

type RemotePlayer = { id: number; a: number; x: number; y: number };

var my_id: number = -1;
export var player_posn = Vector2.Empty();
export var real_player_posn = Vector2.Empty();
export var remote_players = new Map<number, RemotePlayer>();

inputHandler(socket, input);
spriteHandler(socket, sprites);

socket.listen(OnboardPacket, ([id, x, y]) => {
    my_id = id as number;
    player_posn = new Vector2(x as number, y as number);
    real_player_posn = new Vector2(x as number, y as number);

    console.log(`My client ID is ${my_id}`);
});

socket.listen(PlayersPacket, ([players]) => {
    players = players as Uint8Array[];
    var parsed = players.map((p) => ParsePacket(PlayerPacket, p));
    parsed.forEach(([id, a, x, y]) => {
        if (id != my_id) {
            remote_players.set(id as number, {
                id: id as number,
                a: a as number,
                x: x as number,
                y: y as number
            });
        } else {
            real_player_posn.x = x as number;
            real_player_posn.y = y as number;
        }
    });
});

socket.listen(DisconnectPacket, ([id]) => {
    console.log(id);
    remote_players.delete(id as number);
});

SpriteScript.Debug = false;

function lerp(p1: Vector2, p2: Vector2, a: number) {
    return new Vector2(p1.x * (1 - a) + p2.x * a, p1.y * (1 - a) + p2.y * a);
}

var last_frame = Date.now();
function gameLoop() {
    var delta = Date.now() - last_frame;
    last_frame = Date.now();

    renderer.fill(background);

    var speed = 0.5;
    var correction = 0.3;
    var thresh = 5;
    if (input.keyboard.get("KeyW")) player_posn.y -= speed * delta;
    if (input.keyboard.get("KeyS")) player_posn.y += speed * delta;
    if (input.keyboard.get("KeyA")) player_posn.x -= speed * delta;
    if (input.keyboard.get("KeyD")) player_posn.x += speed * delta;

    // var xdelta = player_posn.x - real_player_posn.x;
    // var ydelta = player_posn.y - real_player_posn.y;
    // if (xdelta > thresh) player_posn.x -= correction * delta;
    // if (xdelta < thresh) player_posn.x += correction * delta;
    // if (ydelta > thresh) player_posn.y -= correction * delta;
    // if (ydelta < thresh) player_posn.y += correction * delta;

    player_posn = lerp(player_posn, real_player_posn, correction);

    remote_players.forEach(({ id, a, x, y }) => {
        sprites
            .get("tank")
            ?.render(renderer.ctx, new Vector2(x, y), [
                `Player ${id}`,
                a,
                0,
                180,
                0
            ]);
    });

    sprites
        .get("tank")
        ?.render(renderer.ctx, player_posn, [
            `Player ${my_id} (you)`,
            AngleBetween(player_posn, input.cursor),
            255,
            0,
            0
        ]);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
