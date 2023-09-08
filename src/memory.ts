export interface Vector2 {
    x: number;
    y: number;
}
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}
export interface Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
}
export type Quaternion = Vector4;

export class Reader {
    private buffer: DataView;
    private pos = 0;

    constructor(buffer: ArrayBufferLike) {
        this.buffer = new DataView(buffer);
    }

    get eof() {
        return this.pos >= this.buffer.byteLength;
    }

    readBool() { return this.readUint8() != 0; }

    readUint8() { return this.buffer.getUint8(this.pos++); }
    readInt8() { return this.buffer.getInt8(this.pos++); }

    readInt16() {
        this.pos += 2;
        return this.buffer.getInt16(this.pos - 2, true);
    }
    readUint16() {
        this.pos += 2;
        return this.buffer.getUint16(this.pos - 2, true);
    }

    readInt32() {
        this.pos += 4;
        return this.buffer.getInt32(this.pos - 4, true);
    }
    readUint32() {
        this.pos += 4;
        return this.buffer.getUint32(this.pos - 4, true);
    }

    readInt64() {
        this.pos += 8;
        return this.buffer.getBigInt64(this.pos - 8, true);
    }
    readUint64() {
        this.pos += 8;
        return this.buffer.getBigUint64(this.pos - 8, true);
    }

    readBytes(length: number) {
        let buf = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            buf[i] = this.buffer.getUint8(this.pos++);
        }
        return buf;
    }

    readFloat() {
        this.pos += 4;
        return this.buffer.getFloat32(this.pos - 4, true);
    }

    readDouble() {
        this.pos += 8;
        return this.buffer.getFloat64(this.pos - 8, true);
    }

    readVector2(): Vector2 {
        return {
            x: this.readFloat(),
            y: this.readFloat()
        }
    }
    readVector3(): Vector3 {
        return {
            x: this.readFloat(),
            y: this.readFloat(),
            z: this.readFloat()
        }
    }
    readVector4(): Vector4 {
        return {
            x: this.readFloat(),
            y: this.readFloat(),
            z: this.readFloat(),
            w: this.readFloat()
        }
    }

    readString() {
        let length = this.readUint16();
        return new TextDecoder("utf-8").decode(this.readBytes(length));
    }
}

export class Writer {
    private memory: Uint8Array;
    private buffer: DataView;
    private pos = 0;

    constructor() {
        this.memory = new Uint8Array(256);
        this.buffer = new DataView(this.memory.buffer);
    }

    private ensureCapacity(value: number) {
        let _capacity = this.buffer.byteLength;
        if (value > _capacity) {
            let newCapacity = value;

            if (newCapacity < _capacity * 2)
                newCapacity = _capacity * 2;

            // create new array and copy contents
            let mem = new Uint8Array(newCapacity);
            mem.set(this.memory);

            this.memory = mem;
            this.buffer = new DataView(this.memory.buffer);
        }
    }

    toArray() {
        return new Uint8Array(this.memory.buffer, 0, this.pos);
    }

    writeBool(val: boolean) {
        this.ensureCapacity(this.pos + 1);
        this.buffer.setUint8(this.pos, val ? 1 : 0);
        this.pos += 1;
    }

    writeUint8(val: number) {
        this.ensureCapacity(this.pos + 1);
        this.buffer.setUint8(this.pos, val);
        this.pos += 1;
    }
    writeInt8(val: number) {
        this.ensureCapacity(this.pos + 1);
        this.buffer.setInt8(this.pos, val);
        this.pos += 1;
    }

    writeUint16(val: number) {
        this.ensureCapacity(this.pos + 2);
        this.buffer.setUint16(this.pos, val, true);
        this.pos += 2;
    }
    writeInt16(val: number) {
        this.ensureCapacity(this.pos + 2);
        this.buffer.setInt16(this.pos, val, true);
        this.pos += 2;
    }

    writeUInt32(val: number) {
        this.ensureCapacity(this.pos + 4);
        this.buffer.setUint32(this.pos, val, true);
        this.pos += 4;
    }
    writeInt32(val: number) {
        this.ensureCapacity(this.pos + 4);
        this.buffer.setInt32(this.pos, val, true);
        this.pos += 4;
    }

    writeUInt64(val: bigint) {
        this.ensureCapacity(this.pos + 8);
        this.buffer.setBigUint64(this.pos, val, true);
        this.pos += 8;
    }
    writeInt64(val: bigint) {
        this.ensureCapacity(this.pos + 8);
        this.buffer.setBigInt64(this.pos, val, true);
        this.pos += 8;
    }

    writeFloat(val: number) {
        this.ensureCapacity(this.pos + 4);
        this.buffer.setFloat32(this.pos, val, true);
        this.pos += 4;
    }
    writeDouble(val: number) {
        this.ensureCapacity(this.pos + 8);
        this.buffer.setFloat64(this.pos, val, true);
        this.pos += 8;
    }

    writeVector2(val: Vector2) {
        this.ensureCapacity(this.pos + 8);
        this.buffer.setFloat32(this.pos, val.x, true);
        this.buffer.setFloat32(this.pos + 4, val.y, true);
        this.pos += 8;
    }
    writeVector3(val: Vector3) {
        this.ensureCapacity(this.pos + 12);
        this.buffer.setFloat32(this.pos, val.x, true);
        this.buffer.setFloat32(this.pos + 4, val.y, true);
        this.buffer.setFloat32(this.pos + 8, val.z, true);
        this.pos += 12;
    }
    writeVector4(val: Vector4) {
        this.ensureCapacity(this.pos + 16);
        this.buffer.setFloat32(this.pos, val.x, true);
        this.buffer.setFloat32(this.pos + 4, val.y, true);
        this.buffer.setFloat32(this.pos + 8, val.z, true);
        this.buffer.setFloat32(this.pos + 12, val.w, true);
        this.pos += 16;
    }

    writeBytes(val: Uint8Array) {
        this.ensureCapacity(this.pos + val.length);
        this.memory.set(val, this.pos);
        this.pos += val.length;
    }
    writeString(val: string) {
        let bytes = new TextEncoder().encode(val);
        this.writeUint16(bytes.length)
        this.writeBytes(bytes);
    }
}