import { Color } from "./helpers/color";
import * as PlayerData from "./packets/playerdata";

export function ParsePacket(binary: Uint8Array) {
    var type: PacketType = binary[0];
    var contents: Uint8Array = binary.slice(1);
    var data: any;

    switch (type) {
        case PacketType.PlayerData:
            data = PlayerData.Deserialize(contents);
            break;
    }

    return { type, data };
}

export enum PacketType {
    PlayerData = 0
}

var x = PlayerData.Serialize({
    id: 1,
    username: "william",
    color: new Color(30, 40, 50)
});
