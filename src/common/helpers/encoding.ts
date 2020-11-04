// I hate this entire file but it does its job and works just fine
type BoolByte = [
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean
];

export function EncodeFloat(value: number): Uint8Array {
    return new Uint8Array(new Float32Array([value]).buffer);
}

export function EncodeLongFloat(value: number): Uint8Array {
    return new Uint8Array(new Float64Array([value]).buffer);
}

export function EncodeUint8(value: number): Uint8Array {
    return new Uint8Array([value]);
}

export function EncodeInt8(value: number): Uint8Array {
    return EncodeInt8(value);
}

export function EncodeUint16(value: number): Uint8Array {
    return new Uint8Array(new Uint16Array([value]).buffer);
}

export function EncodeInt16(value: number): Uint8Array {
    return new Uint8Array(new Int16Array([value]).buffer);
}

export function EncodeUint32(value: number): Uint8Array {
    return new Uint8Array(new Uint32Array([value]).buffer);
}

export function EncodeInt32(value: number): Uint8Array {
    return new Uint8Array(new Int32Array([value]).buffer);
}

export function EncodeBoolean(value: boolean): Uint8Array {
    return new Uint8Array(new Uint8Array([value ? 255 : 0]).buffer);
}

export function EncodeFlags(value: BoolByte): Uint8Array {
    var byte: number = 0;
    for (var i = 0; i < value.length; i++)
        byte = byte | ((value[i] ? 1 : 0) << (7 - i));

    return new Uint8Array([byte]);
}

export function EncodeString(str: string): Uint8Array {
    var array = new Uint8Array(1 + str.length);
    array.set(EncodeUint8(str.length), 0);

    for (var i = 0; i < str.length; i++) array[i + 1] = str.charCodeAt(i);

    return array;
}

export function EncodeLongString(str: string): Uint8Array {
    var array = new Uint8Array(2 + str.length);
    array.set(EncodeInt16(str.length), 0);

    for (var i = 0; i < str.length; i++) array[i + 2] = str.charCodeAt(i);

    return array;
}

export function DecodeFloat(data: Uint8Array, idx: number = 0): number {
    return new Float32Array(data.slice(idx, idx + 4).buffer)[0];
}

export function DecodeLongFloat(data: Uint8Array, idx: number = 0): number {
    return new Float64Array(data.slice(idx, idx + 8).buffer)[0];
}

export function DecodeUint8(data: Uint8Array, idx: number = 0): number {
    return data[idx];
}

export function DecodeInt8(data: Uint8Array, idx: number = 0): number {
    return new Int8Array(data.slice(idx, idx + 1).buffer)[0];
}

export function DecodeUint16(data: Uint8Array, idx: number = 0): number {
    return new Uint16Array(data.slice(idx, idx + 2).buffer)[0];
}

export function DecodeInt16(data: Uint8Array, idx: number = 0): number {
    return new Int16Array(data.slice(idx, idx + 2).buffer)[0];
}

export function DecodeUint32(data: Uint8Array, idx: number = 0): number {
    return new Uint32Array(data.slice(idx, idx + 4).buffer)[0];
}

export function DecodeInt32(data: Uint8Array, idx: number = 0): number {
    return new Int32Array(data.slice(idx, idx + 4).buffer)[0];
}

export function DecodeBoolean(data: Uint8Array, idx: number = 0): boolean {
    return data[idx] != 0;
}

export function DecodeFlags(data: Uint8Array, idx: number = 0): BoolByte {
    var number = data[idx];
    var flags: BoolByte = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ];

    for (var i = 0; i < 8; i++) flags[i] = (number & (1 << (7 - i))) != 0;

    return flags;
}

export function DecodeString(data: Uint8Array, idx: number = 0): string {
    var str = "";
    var length = DecodeUint8(data, idx);

    for (var i = 0; i < length; i++)
        str += String.fromCharCode(data[idx + 1 + i]);

    return str;
}

export function DecodeLongString(data: Uint8Array, idx: number = 0): string {
    var str = "";
    var length = DecodeUint16(data, idx);

    for (var i = 0; i < length; i++)
        str += String.fromCharCode(data[idx + 2 + i]);

    return str;
}
