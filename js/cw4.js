class Reader {
    constructor(buffer) {
        this.pos = 0;
        this.buffer = new DataView(buffer);
    }
    readBool() { return this.readByte() != 0; }
    readByte() { return this.buffer.getUint8(this.pos++); }
    readInt16() {
        this.pos += 2;
        return this.buffer.getInt16(this.pos - 2);
    }
    readUint16() {
        this.pos += 2;
        return this.buffer.getUint16(this.pos - 2);
    }
    readInt32() {
        this.pos += 4;
        return this.buffer.getInt32(this.pos - 4);
    }
    readUint32() {
        this.pos += 4;
        return this.buffer.getUint32(this.pos - 4);
    }
    readInt64() {
        const left = BigInt(this.buffer.getUint32(this.pos) >>> 0);
        const right = BigInt(this.buffer.getUint32(this.pos + 4) >>> 0);
        return (left << 32n) | right;
    }
    readBytes(length) {
        let buf = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            buf[i] = this.buffer.getUint8(this.pos++);
        }
        return buf;
    }
    readFloat() {
        this.pos += 4;
        return this.buffer.getFloat32(this.pos - 4);
    }
    readDouble() {
        this.pos += 8;
        return this.buffer.getFloat64(this.pos - 8);
    }
    readVector2() {
        return {
            x: this.readFloat(),
            y: this.readFloat()
        };
    }
    readVector3() {
        return {
            x: this.readFloat(),
            y: this.readFloat(),
            z: this.readFloat()
        };
    }
    readVector4() {
        return {
            x: this.readFloat(),
            y: this.readFloat(),
            z: this.readFloat(),
            w: this.readFloat()
        };
    }
    readString() {
        let length = this.readUint16();
        return new TextDecoder("utf-8").decode(this.readBytes(length));
    }
}
class Tag {
}
class TagBool {
    constructor(reader) {
        this.value = reader.readBool();
    }
}
class TagByte {
    constructor(reader) {
        this.value = reader.readByte();
    }
}
class TagShort {
    constructor(reader) {
        this.value = reader.readInt16();
    }
}
class TagInt {
    constructor(reader) {
        this.value = reader.readInt32();
    }
}
class TagLong {
    constructor(reader) {
        this.value = reader.readInt64();
    }
}
class TagFloat {
    constructor(reader) {
        this.value = reader.readFloat();
    }
}
class TagDouble {
    constructor(reader) {
        this.value = reader.readDouble();
    }
}
class TagVector2 {
    constructor(reader) {
        this.value = reader.readVector2();
    }
}
class TagVector3 {
    constructor(reader) {
        this.value = reader.readVector3();
    }
}
class TagVector4 {
    constructor(reader) {
        this.value = reader.readVector4();
    }
}
class TagQuaternion {
    constructor(reader) {
        this.value = reader.readVector4();
    }
}
class TagBoolArray {
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readBool();
        }
    }
}
class TagByteArray {
    constructor(reader) {
        let length = reader.readInt32();
        this.value = reader.readBytes(length);
    }
}
class TagShortArray {
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Int16Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt16();
        }
    }
}
class TagIntArray {
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Int32Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt32();
        }
    }
}
class TagLongArray {
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new BigInt64Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt64();
        }
    }
}
class TagFloatArray {
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readFloat();
        }
    }
}
class TagVector2Array {
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readVector2();
        }
    }
}
class TagVector3Array {
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readVector3();
        }
    }
}
class TagVector4Array {
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readVector4();
        }
    }
}
class TagString {
    constructor(reader) {
        this.value = reader.readString();
    }
}
class TagList {
    constructor(reader) {
        var type = reader.readByte();
        var length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = readTag(reader, type);
        }
    }
}
class TagCompound {
    constructor(reader) {
        this.dict = new Map();
        while (true) {
            let id = reader.readByte();
            if (id == 0) {
                break;
            }
            var key = reader.readString();
            var val = readTag(reader, id);
            this.dict.set(key, val);
        }
    }
}
function readTag(reader, id) {
    switch (id) {
        case 0x1: return new TagInt(reader);
        case 0x2: return new TagFloat(reader);
        case 0x3: return new TagString(reader);
        case 0x4: return new TagList(reader);
        case 0x5: return new TagShort(reader);
        case 0x6: return new TagDouble(reader);
        case 0x7: return new TagByteArray(reader);
        case 0x8: return new TagByte(reader);
        case 0x9: return new TagLong(reader);
        case 0xA: return new TagCompound(reader);
        case 0xB: return new TagIntArray(reader);
        case 0xE3: return new TagBoolArray(reader);
        case 0xE4: return new TagVector4Array(reader);
        case 0xE5: return new TagVector4(reader);
        case 0xE6: return new TagBool(reader);
        case 0xE8: return new TagVector2Array(reader);
        case 0xE9: return new TagVector3Array(reader);
        case 0xEA: return new TagVector2(reader);
        case 0xEB: return new TagVector3(reader);
        case 0xEC: return new TagQuaternion(reader);
        case 0xF3: return new TagFloatArray(reader);
        case 0xF4: return new TagLongArray(reader);
        case 0xF7: return new TagShortArray(reader);
        default: throw "Unknown tag";
    }
}
function load(buffer) {
    let compressed = Array.from(new Uint8Array(buffer));
    compressed = compressed.slice(4);
    let data = new Zlib.Gunzip(new Uint8Array(compressed)).decompress();
    let reader = new Reader(data);
    reader.readByte();
    reader.readString();
    return new TagCompound(reader);
}
