import { Color } from "./helpers/color";
import { Data, DecodeMulti, EncodeMulti, Type } from "./helpers/encoding";

class Player {
    static readonly Schema: Type[] = [
        Type.Uint16,
        Type.String,
        Type.Uint8,
        Type.Uint8,
        Type.Uint8
    ];

    public id: number;
    public username: string;
    public color: Color;

    constructor(id: number, username: string, color: Color) {
        this.id = id;
        this.username = username;
        this.color = color;
    }

    static Serialize(player: Player): Uint8Array {
        return EncodeMulti(
            [
                player.id,
                player.username,
                player.color.red,
                player.color.green,
                player.color.blue
            ],
            Player.Schema
        );
    }

    static Deserialize(data: Uint8Array): Player {
        var [id, username, r, g, b] = DecodeMulti(data, Player.Schema);
        var color = new Color(r as number, g as number, b as number);
        return new Player(id as number, username as string, color);
    }
}

var player = new Player(0, "wg4568", Color.RandomPastel());
var data = Player.Serialize(player);

console.log(data, Player.Deserialize(data));
