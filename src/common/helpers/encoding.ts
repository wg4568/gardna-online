import { assert } from "console";

function EncodeFloat(value: number): Uint8Array {
    return new Uint8Array(new Float32Array([value]).buffer);
}

function EncodeLongFloat(value: number): Uint8Array {
    return new Uint8Array(new Float64Array([value]).buffer);
}

function EncodeUint16(value: number): Uint8Array {
    return new Uint8Array(new Uint16Array([value]).buffer);
}

function EncodeInt16(value: number): Uint8Array {
    return new Uint8Array(new Int16Array([value]).buffer);
}

function EncodeUint32(value: number): Uint8Array {
    return new Uint8Array(new Uint32Array([value]).buffer);
}

function EncodeInt32(value: number): Uint8Array {
    return new Uint8Array(new Int32Array([value]).buffer);
}

function EncodeBoolean(value: boolean): Uint8Array {
    return new Uint8Array(new Uint8Array([value ? 255 : 0]).buffer);
}

function EncodeFlags(values: boolean[]): Uint8Array {
    assert(values.length == 8, "values must have a length of 8");

    var byte: number = 0;
    for (var i = 0; i < values.length; i++)
        byte = byte | ((values[i] ? 1 : 0) << (7 - i));

    return new Uint8Array([byte]);
}

function EncodeString(str: string): Uint8Array {
    var array = new Uint8Array(1 + str.length);
    array[0] = str.length;

    for (var i = 0; i < str.length; i++) array[i + 1] = str.charCodeAt(i);

    return array;
}

function EncodeLongString(str: string): Uint8Array {
    var array = new Uint8Array(2 + str.length);
    array.set(EncodeInt16(str.length), 0);

    for (var i = 0; i < str.length; i++) array[i + 2] = str.charCodeAt(i);

    return array;
}

function DecodeFloat(data: Uint8Array, idx: number) {
    return {
        value: new Float32Array(data.subarray(idx, idx + 4).buffer)[0],
        delta: 4
    };
}

function DecodeLongFloat(data: Uint8Array, idx: number) {
    return {
        value: new Float64Array(data.subarray(idx, idx + 8).buffer)[0],
        delta: 8
    };
}

function DecodeUint16(data: Uint8Array, idx: number) {
    return {
        value: new Uint16Array(data.subarray(idx, idx + 2).buffer)[0],
        delta: 2
    };
}

function DecodeInt16(data: Uint8Array, idx: number) {
    return {
        value: new Int16Array(data.subarray(idx, idx + 2).buffer)[0],
        delta: 2
    };
}

function DecodeUint32(data: Uint8Array, idx: number) {
    return {
        value: new Uint32Array(data.subarray(idx, idx + 4).buffer)[0],
        delta: 4
    };
}

function DecodeInt32(data: Uint8Array, idx: number) {
    return {
        value: new Int32Array(data.subarray(idx, idx + 4).buffer)[0],
        delta: 4
    };
}

function DecodeBoolean(data: Uint8Array, idx: number) {
    return {
        value: data[idx] != 0,
        delta: 1
    };
}

function DecodeFlags(data: Uint8Array, idx: number) {
    var number = data[idx];
    var flags: boolean[] = [];

    for (var i = 0; i < 8; i++) flags[i] = (number & (1 << (7 - i))) != 0;

    return {
        value: flags,
        delta: 1
    };
}

function DecodeString(data: Uint8Array, idx: number) {
    var str = "";
    var length = data[idx];

    for (var i = 0; i < length; i++)
        str += String.fromCharCode(data[idx + 1 + i]);

    return {
        value: str,
        delta: 1 + length
    };
}

function DecodeLongString(data: Uint8Array, idx: number) {
    var str = "";
    var length = DecodeUint16(data, idx).value;

    for (var i = 0; i < length; i++)
        str += String.fromCharCode(data[idx + 2 + i]);

    return {
        value: str,
        delta: 2 + length
    };
}
