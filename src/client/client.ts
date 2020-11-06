import { Color } from "../common/helpers/color";
import { DecodeMulti, EncodeMulti, Type } from "../common/helpers/encoding";
import { Vector2 } from "../common/helpers/vector";
import { PacketType, SplitPacket } from "../common/packets";

const socket = new WebSocket("ws://localhost:3000");
socket.binaryType = "arraybuffer";

class Player {
    public readonly id: number;
    public username: string;
    public color: Color;
    public position: Vector2 = Vector2.Empty();

    constructor(id: number, username: string, color: Color) {
        this.id = id;
        this.username = username;
        this.color = color;
    }
}

export var players = new Map<number, Player>();

socket.onopen = () => {
    socket.send(
        EncodeMulti(
            ["William", 255, 0, 0],
            [Type.String, Type.Uint8, Type.Uint8]
        )
    );
};

socket.onmessage = (msg) => {
    var { type, packet } = SplitPacket(new Uint8Array(msg.data));
    switch (type) {
        case PacketType.PlayerData: {
            let [id, username, r, g, b] = DecodeMulti(packet, [
                Type.Uint16,
                Type.String,
                Type.Uint8,
                Type.Uint8,
                Type.Uint8
            ]);
            var color = new Color(r as number, g as number, b as number);
            id = id as number;
            username = username as string;

            let p = players.get(id);
            if (p) {
                p.username = username;
                p.color = color;
            } else {
                players.set(id, new Player(id, username, color));
            }
        }
    }
};
