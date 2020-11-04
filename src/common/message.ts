import { Color } from "./helpers/color";
import { EncodeInt8, EncodeString, EncodeUint8 } from "./helpers/encoding";
import { JoinBuffers } from "./helpers/helpers";
import * as encoding from "./helpers/encoding";

function SerializePlayer(id: number, username: string, color: Color) {
    return JoinBuffers([
        encoding.EncodeUint16(id),
        encoding.EncodeString(username),
        encoding.EncodeUint8(color.red),
        encoding.EncodeUint8(color.green),
        encoding.EncodeUint8(color.blue)
    ]);
}

function DeserializePlayerdata(data: Uint8Array) {
    var idx = 0;

    var id = encoding.DecodeUint16(data, idx);
    var username = encoding.DecodeString(data, (idx += 2));
    var red = encoding.DecodeUint8(data, (idx += username.length + 1));
    var green = encoding.DecodeUint8(data, (idx += 1));
    var blue = encoding.DecodeUint8(data, (idx += 1));

    var color = new Color(red, green, blue);

    return { id, username, color };
}

var p = SerializePlayer(56, "William", new Color(1, 2, 3));

console.log(p, DeserializePlayerdata(p));
