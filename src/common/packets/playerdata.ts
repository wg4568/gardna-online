import { Color } from "../helpers/color";
import { DecodeMulti, EncodeMulti, Type } from "../helpers/encoding";

type PlayerData = { id: number; username: string; color: Color };

export const Schema: Type[] = [
    Type.Uint16,
    Type.String,
    Type.Uint8,
    Type.Uint8,
    Type.Uint8
];

export function Serialize(player: PlayerData): Uint8Array {
    return EncodeMulti(
        [
            player.id,
            player.username,
            player.color.red,
            player.color.green,
            player.color.blue
        ],
        Schema
    );
}

export function Deserialize(data: Uint8Array): PlayerData {
    var [id, username, r, g, b] = DecodeMulti(data, Schema);
    var color = new Color(r as number, g as number, b as number);
    return { id: id as number, username: username as string, color: color };
}
