import { JoinBuffers } from "./helpers";

// I hate this entire file but it does its job and works just fine
export type Flags = [
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean
];

export enum Type {
    Float32,
    Float64,
    Uint8,
    Int8,
    Uint16,
    Int16,
    Uint32,
    Int32,
    Boolean,
    Flags,
    String,
    LongString,
    Array,
    LongArray
}

export type Data = number | string | boolean | Flags | Uint8Array[];

export function DecodeMulti(data: Uint8Array, types: Type[]): Data[] {
    var decoded: Data[] = [];
    var idx = 0;

    for (var i = 0; i < types.length; i++) {
        switch (types[i]) {
            case Type.Float32:
                decoded.push(DecodeFloat32(data, idx));
                idx += 4;
                break;
            case Type.Float64:
                decoded.push(DecodeFloat64(data, idx));
                idx += 8;
                break;
            case Type.Uint8:
                decoded.push(DecodeUint8(data, idx));
                idx += 1;
                break;
            case Type.Int8:
                decoded.push(DecodeInt8(data, idx));
                idx += 2;
                break;
            case Type.Uint16:
                decoded.push(DecodeUint16(data, idx));
                idx += 2;
                break;
            case Type.Uint32:
                decoded.push(DecodeUint32(data, idx));
                idx += 4;
                break;
            case Type.Int32:
                decoded.push(DecodeInt32(data, idx));
                idx += 4;
                break;
            case Type.Boolean:
                decoded.push(DecodeBoolean(data, idx));
                idx += 1;
                break;
            case Type.Flags:
                decoded.push(DecodeFlags(data, idx));
                idx += 1;
                break;
            case Type.String:
                let str = DecodeString(data, idx);
                decoded.push(str);
                idx += 1 + str.length;
                break;
            case Type.LongString:
                let longstr = DecodeLongString(data, idx);
                decoded.push(longstr);
                idx += 1 + longstr.length;
                break;
            case Type.Array:
                let array = DecodeArray(data, idx);
                decoded.push(array);
                idx +=
                    1 +
                    array.length +
                    array.map((e) => e.length).reduce((a, b) => a + b);
                break;
            case Type.LongArray:
                let longarray = DecodeLongArray(data, idx);
                decoded.push(longarray);
                idx +=
                    2 +
                    longarray.length * 2 +
                    longarray.map((e) => e.length).reduce((a, b) => a + b);
                break;
        }
    }

    return decoded;
}

export function EncodeMulti(data: Data[], types: Type[]): Uint8Array {
    var elements: Uint8Array[] = [];

    for (var i = 0; i < types.length; i++) {
        switch (types[i]) {
            case Type.Float32:
                elements.push(EncodeFloat32(data[i] as number));
                break;
            case Type.Float64:
                elements.push(EncodeFloat64(data[i] as number));
                break;
            case Type.Uint8:
                elements.push(EncodeUint8(data[i] as number));
                break;
            case Type.Int8:
                elements.push(EncodeInt8(data[i] as number));
                break;
            case Type.Uint16:
                elements.push(EncodeUint16(data[i] as number));
                break;
            case Type.Uint32:
                elements.push(EncodeUint32(data[i] as number));
                break;
            case Type.Int32:
                elements.push(EncodeInt32(data[i] as number));
                break;
            case Type.Boolean:
                elements.push(EncodeBoolean(data[i] as boolean));
                break;
            case Type.Flags:
                elements.push(EncodeFlags(data[i] as Flags));
                break;
            case Type.String:
                elements.push(EncodeString(data[i] as string));
                break;
            case Type.LongString:
                elements.push(EncodeLongString(data[i] as string));
                break;
            case Type.Array:
                elements.push(EncodeArray(data[i] as Uint8Array[]));
                break;
            case Type.LongArray:
                elements.push(EncodeLongArray(data[i] as Uint8Array[]));
                break;
        }
    }

    return JoinBuffers(elements);
}

// TYPE ENCODING
export function EncodeFloat32(value: number): Uint8Array {
    return new Uint8Array(new Float32Array([value]).buffer);
}

export function EncodeFloat64(value: number): Uint8Array {
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
    return EncodeUint16(value);
}

export function EncodeUint32(value: number): Uint8Array {
    return new Uint8Array(new Uint32Array([value]).buffer);
}

export function EncodeInt32(value: number): Uint8Array {
    return EncodeUint32(value);
}

export function EncodeBoolean(value: boolean): Uint8Array {
    return new Uint8Array(new Uint8Array([value ? 255 : 0]).buffer);
}

export function EncodeFlags(value: Flags): Uint8Array {
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

export function EncodeArray(data: Uint8Array[]): Uint8Array {
    var buffers: Uint8Array[] = [EncodeUint8(data.length)];

    for (var i = 0; i < data.length; i++) {
        buffers.push(EncodeUint8(data[i].length));
        buffers.push(data[i]);
    }

    return JoinBuffers(buffers);
}

export function EncodeLongArray(data: Uint8Array[]): Uint8Array {
    var buffers: Uint8Array[] = [EncodeUint16(data.length)];

    for (var i = 0; i < data.length; i++) {
        buffers.push(EncodeUint16(data[i].length));
        buffers.push(data[i]);
    }

    return JoinBuffers(buffers);
}

// TYPE DECODING
export function DecodeFloat32(data: Uint8Array, idx: number = 0): number {
    return new Float32Array(data.slice(idx, idx + 4).buffer)[0];
}

export function DecodeFloat64(data: Uint8Array, idx: number = 0): number {
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

export function DecodeFlags(data: Uint8Array, idx: number = 0): Flags {
    var number = data[idx];
    var flags: Flags = [false, false, false, false, false, false, false, false];

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

export function DecodeArray(data: Uint8Array, idx: number): Uint8Array[] {
    var array: Uint8Array[] = [];
    var elements: number = DecodeUint8(data, idx);
    var posn = idx + 1;

    for (var i = 0; i < elements; i++) {
        let length: number = DecodeUint8(data, posn);
        array.push(data.slice(posn + 1, posn + 1 + length));
        posn += 1 + length;
    }

    return array;
}

export function DecodeLongArray(data: Uint8Array, idx: number): Uint8Array[] {
    var array: Uint8Array[] = [];
    var elements: number = DecodeUint16(data, idx);
    var posn = idx + 2;

    for (var i = 0; i < elements; i++) {
        let length: number = DecodeUint16(data, posn);
        array.push(data.slice(posn + 2, posn + 2 + length));
        posn += 2 + length;
    }

    return array;
}
