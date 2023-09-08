import { Reader, Vector2, Vector3, Vector4, Quaternion, Writer } from "../memory.js";

//#region Tags
interface Tag {
    save(w: Writer): void;
    value?: any;
}

class TagBool implements Tag {
    value: boolean;
    constructor(reader: Reader) {
        this.value = reader.readBool();
    }

    save(w: Writer) {
        w.writeBool(this.value);
    }
}

class TagByte implements Tag {
    value: number;
    constructor(reader: Reader) {
        this.value = reader.readUint8();
    }

    save(w: Writer) {
        w.writeUint8(this.value);
    }
}
class TagSByte implements Tag {
    value: number;
    constructor(reader: Reader) {
        this.value = reader.readInt8();
    }

    save(w: Writer) {
        w.writeInt8(this.value);
    }
}

class TagShort implements Tag {
    value: number;
    constructor(reader: Reader) {
        this.value = reader.readInt16();
    }
    save(w: Writer) {
        w.writeInt16(this.value);
    }
}
class TagUShort implements Tag {
    value: number;
    constructor(reader: Reader) {
        this.value = reader.readUint16();
    }
    save(w: Writer) {
        w.writeUint16(this.value);
    }
}

class TagInt implements Tag {
    value: number;
    constructor(reader: Reader) {
        this.value = reader.readInt32();
    }
    save(w: Writer) {
        w.writeInt32(this.value);
    }
}
class TagUInt implements Tag {
    value: number;
    constructor(reader: Reader) {
        this.value = reader.readUint32();
    }
    save(w: Writer): void {
        w.writeUInt32(this.value);
    }
}

class TagLong implements Tag {
    value: bigint;
    constructor(reader: Reader) {
        this.value = reader.readInt64();
    }
    save(w: Writer): void {
        w.writeInt64(this.value);
    }
}
class TagULong implements Tag {
    value: bigint;
    constructor(reader: Reader) {
        this.value = reader.readUint64();
    }
    save(w: Writer): void {
        w.writeUInt64(this.value);
    }
}

class TagFloat implements Tag {
    value: number;
    constructor(reader: Reader) {
        this.value = reader.readFloat();
    }
    save(w: Writer): void {
        w.writeFloat(this.value);
    }
}
class TagDouble implements Tag {
    value: number;
    constructor(reader: Reader) {
        this.value = reader.readDouble();
    }
    save(w: Writer): void {
        w.writeDouble(this.value);
    }
}

class TagVector2 implements Tag {
    value: Vector2;
    constructor(reader: Reader) {
        this.value = reader.readVector2();
    }
    save(w: Writer): void {
        w.writeVector2(this.value);
    }
}
class TagVector3 implements Tag {
    value: Vector3;
    constructor(reader: Reader) {
        this.value = reader.readVector3();
    }
    save(w: Writer): void {
        w.writeVector3(this.value);
    }
}
class TagVector4 implements Tag {
    value: Vector4;
    constructor(reader: Reader) {
        this.value = reader.readVector4();
    }
    save(w: Writer): void {
        w.writeVector4(this.value);
    }
}

class TagQuaternion implements Tag {
    value: Quaternion;
    constructor(reader: Reader) {
        this.value = reader.readVector4();
    }
    save(w: Writer): void {
        w.writeVector4(this.value);
    }
}

class TagBoolArray implements Tag {
    value: boolean[];
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readBool();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeBool(this.value[i]);
        }
    }
}

class TagByteArray implements Tag {
    value: Uint8Array;
    constructor(reader: Reader) {
        let length = reader.readInt32()
        this.value = reader.readBytes(length);
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        w.writeBytes(this.value);
    }
}
class TagSByteArray implements Tag {
    value: Int8Array;
    constructor(reader: Reader) {
        let length = reader.readInt32();
        this.value = new Int8Array(length);

        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt8();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeInt8(this.value[i]);
        }
    }
}

class TagShortArray implements Tag {
    value: Int16Array;
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Int16Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt16();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeInt16(this.value[i]);
        }
    }
}
class TagUShortArray implements Tag {
    value: Uint16Array;
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Uint16Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readUint16();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeUint16(this.value[i]);
        }
    }
}

class TagIntArray implements Tag {
    value: Int32Array;
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Int32Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt32();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeInt32(this.value[i]);
        }
    }
}
class TagUIntArray implements Tag {
    value: Uint32Array;
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Uint32Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readUint32();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeUInt32(this.value[i]);
        }
    }
}

class TagLongArray implements Tag {
    value: BigInt64Array;
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new BigInt64Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt64();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeInt64(this.value[i]);
        }
    }
}
class TagULongArray implements Tag {
    value: BigUint64Array;
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new BigUint64Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readUint64();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeUInt64(this.value[i]);
        }
    }
}

class TagFloatArray implements Tag {
    value: Float32Array;
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readFloat();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeFloat(this.value[i]);
        }
    }
}
class TagDoubleArray implements Tag {
    value: Float64Array;
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Float64Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readDouble();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeDouble(this.value[i]);
        }
    }
}

class TagVector2Array implements Tag {
    value: Vector2[];
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readVector2();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeVector2(this.value[i]);
        }
    }
}
class TagVector3Array implements Tag {
    value: Vector3[];
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readVector3();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeVector3(this.value[i]);
        }
    }
}
class TagVector4Array implements Tag {
    value: Vector4[];
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readVector4();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeVector4(this.value[i]);
        }
    }
}

class TagStringArray implements Tag {
    value: string[];
    constructor(reader: Reader) {
        let length = reader.readInt32();

        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readString();
        }
    }
    save(w: Writer): void {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeString(this.value[i]);
        }
    }
}

class TagString implements Tag {
    value: string;
    constructor(reader: Reader) {
        this.value = reader.readString();
    }
    save(w: Writer): void {
        w.writeString(this.value);
    }

    toString() {
        return this.value;
    }
}

class TagList implements Tag {
    type: number;
    value: Tag[];
    constructor(reader: Reader) {
        this.type = reader.readUint8();

        let length = reader.readInt32();
        this.value = new Array(length);

        for (let i = 0; i < length; i++) {
            this.value[i] = readTag(reader, this.type);
        }
    }
    save(w: Writer): void {
        w.writeUint8(this.type);
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            this.value[i].save(w);
        }
    }

    search(value: string, path = "") {
        for (let i = 0; i < this.value.length; i++) {
            searchTag(value, this.value[i], `${path}[${i}]`);
        }
    }
}

class TagCompound implements Tag {
    dict = new Map<string, Tag>();

    constructor(reader: Reader) {
        while (!reader.eof) {
            let id = reader.readUint8();

            if (id == 0) {
                break;
            }

            let key = reader.readString();
            let val = readTag(reader, id);

            this.dict.set(key, val);
        }
    }
    save(w: Writer): void {
        for (const [key, val] of this.dict) {
            w.writeUint8(getType(val));
            w.writeString(key);
            val.save(w);
        }
        w.writeUint8(0);
    }

    search(value: string, path = "") {
        for (const [key, val] of this.dict) {
            searchTag(value, val, `${path}->${key}`);
        }
    }
}

function searchTag(value: string, val, path = "") {
    if (val instanceof TagCompound || val instanceof TagList) {
        val.search(value, path);
    } else if (val instanceof TagString) {
        if (val.value.toLowerCase().includes(value)) {
            debugger;
        }
    }
}

function readTag(reader: Reader, id: number) {
    switch (id) {
        // case 0x0: QuadsModel
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
        case 0xE7: return new TagStringArray(reader);
        case 0xE8: return new TagVector2Array(reader);
        case 0xE9: return new TagVector3Array(reader);
        case 0xEA: return new TagVector2(reader);
        case 0xEB: return new TagVector3(reader);
        case 0xEC: return new TagQuaternion(reader);
        case 0xEE: return new TagULongArray(reader);
        case 0xEF: return new TagUIntArray(reader);
        case 0xF0: return new TagUShortArray(reader);
        case 0xF1: return new TagSByteArray(reader);
        case 0xF2: return new TagDoubleArray(reader);
        case 0xF3: return new TagFloatArray(reader);
        case 0xF4: return new TagLongArray(reader);
        // case 0xF5: // TagTimeSpan
        // case 0xF6: // TagDateTime
        case 0xF7: return new TagShortArray(reader);
        case 0xF8: return new TagULong(reader);
        case 0xF9: return new TagUInt(reader);
        case 0xFA: return new TagUShort(reader);
        case 0xFB: return new TagSByte(reader);
        // case 0xFD: // TagIP
        // case 0xFE: // TagMAC
        default:
            alert("Error: Unknown tag '" + id + "'\n Please message Redcrafter on discord or open an issue on Github");
            throw "Unknown tag";
    }
}
function getType(tag: Tag): number {
    return {
        "TagInt": 0x1,
        "TagFloat": 0x2,
        "TagString": 0x3,
        "TagList": 0x4,
        "TagShort": 0x5,
        "TagDouble": 0x6,
        "TagByteArray": 0x7,
        "TagByte": 0x8,
        "TagLong": 0x9,
        "TagCompound": 0xA,
        "TagIntArray": 0xB,
        "TagBoolArray": 0xE3,
        "TagVector4Array": 0xE4,
        "TagVector4": 0xE5,
        "TagBool": 0xE6,
        "TagStringArray": 0xE7,
        "TagVector2Array": 0xE8,
        "TagVector3Array": 0xE9,
        "TagVector2": 0xEA,
        "TagVector3": 0xEB,
        "TagQuaternion": 0xEC,
        "TagULongArray": 0xEE,
        "TagUIntArray": 0xEF,
        "TagUShortArray": 0xF0,
        "TagSByteArray": 0xF1,
        "TagDoubleArray": 0xF2,
        "TagFloatArray": 0xF3,
        "TagLongArray": 0xF4,
        "TagTimeSpan": 0xF5,
        "TagDateTime": 0xF6,
        "TagShortArray": 0xF7,
        "TagULong": 0xF8,
        "TagUInt": 0xF9,
        "TagUShort": 0xFA,
        "TagSByte": 0xFB,
        "TagIP": 0xFD,
        "TagMAC": 0xFE
    }[tag.constructor.name];
}
//#endregion

const enum Objective {
    Nullify = 1 << 0,
    Totems = 1 << 1,
    Reclaim = 1 << 2,
    Survive = 1 << 3,
    Collect = 1 << 4,
    Custom = 1 << 5
}

class ColonialSpace {
    public Id: number;
    public UnixTime: number;
    public Md5: string;
    public Author: string;
    public Name: string;
    public Width: number;
    public Height: number;

    public Objective: Objective;

    public Tags: string[];
    public Thumbs: number;

    // Forum topic id
    public Topic: number;

    constructor(data: Element) {
        this.Id = parseFloat(data.querySelector("i").textContent);
        this.UnixTime = parseFloat(data.querySelector("t").textContent);
        this.Md5 = data.querySelector("g").textContent;
        this.Author = data.querySelector("a").textContent;
        this.Name = data.querySelector("l").textContent;
        this.Width = parseFloat(data.querySelector("w").textContent);
        this.Height = parseFloat(data.querySelector("h").textContent);
        this.Objective = parseInt(data.querySelector("o").textContent);

        this.Tags = data.querySelector("s").textContent.split(',');
        this.Thumbs = parseInt(data.querySelector("b").textContent);

        this.Topic = parseInt(data.querySelector("p").textContent);
        // this.ThumbSize = parseInt(data.querySelector("u").textContent); // why?
    }

    get imageUrl() {
        return `https://knucklecracker.com/creeperworld4/queryMaps.php?query=thumbnail&guid=${this.Md5}`;
    }

    async download() {
        let buffer = await (await fetch(`https://knucklecracker.com/creeperworld4/queryMaps.php?query=map&guid=${this.Md5}`)).arrayBuffer();
        return loadMap(new Uint8Array(buffer));
    }
}

export class Cw4Map {
    Width: number;
    Height: number;
    World: World;
    CPacks?: CPack[];
    Units: Unit[];

    constructor(data: TagCompound) {
        this.Width = data.dict.get("cwidth").value;
        this.Height = data.dict.get("cheight").value;
        this.CPacks = data.dict.get("cpacks")?.value.map(x => new CPack(x));
        this.World = new World(data.dict.get("world") as TagCompound);
        this.Units = data.dict.get("units").value.map(x => new Unit(x));
    }
}

class Unit {
    Guid: string;
    Id: number;

    Position: Vector3

    constructor(data: TagCompound) {
        this.Guid = data.dict.get("a").value;
        this.Id = data.dict.get("b").value;

        this.Position = data.dict.get("ua").value;
    }
}

class World {
    Theme: Theme;
    Terrain: Uint8Array;

    constructor(data: TagCompound) {
        this.Theme = new Theme(data.dict.get("theme") as TagCompound);
        this.Terrain = data.dict.get("t").value;
    }
}

class Theme {
    TextureId: Int16Array;
    TextureColor: Vector4[];
    TextureIntensity: Float32Array;
    TextureScales: Float32Array;

    Normals: Int16Array;
    NormalsIntensity: Float32Array;
    NormalsScale: Float32Array;

    WallTexture: number;
    WallColor: Vector4;
    WallScale: number;

    constructor(data: TagCompound) {
        // a - ?
        this.TextureId = data.dict.get("b").value;
        this.TextureScales = data.dict.get("c").value;
        // d - ?
        this.TextureColor = data.dict.get("e").value;

        this.Normals = data.dict.get("f").value;
        this.NormalsIntensity = data.dict.get("g").value;
        this.NormalsScale = data.dict.get("h").value;

        // i - ?
        this.WallTexture = data.dict.get("j").value;
        this.WallScale = data.dict.get("k").value;
        this.WallColor = data.dict.get("l").value;

        // m - wallNormal
        // n - wallNormalAmt
        // o - WallNormalScale
        this.TextureIntensity = data.dict.get("p").value;

        // debugger;
    }
}

type Constructor<T extends {} = {}> = new (...args: any[]) => T;

function dictArray<T>(data: TagCompound, ctor: Constructor<T>): T[] {
    if (!data) return null;

    let res = [];
    for (const [key, val] of data.dict) {
        res[parseInt(key)] = new ctor(val);
    }
    return res;
}

export class CPack {
    Guid: string;
    Name: string;
    Models: Model[];
    Textures: Texture[];
    Units?: CPackUnit[];
    Scripts: Script[];
    Notes?: string;
    Attributions?: string;
    GlobalControlPre?: PreScript;
    GlobalControlPost?: PostScript;

    constructor(data: TagCompound) {
        this.Guid = data.dict.get("a").value;
        this.Name = data.dict.get("b").value;
        this.Models = dictArray(data.dict.get("c") as TagCompound, Model);
        this.Textures = dictArray(data.dict.get("d") as TagCompound, Texture);
        this.Units = dictArray(data.dict.get("e") as TagCompound, CPackUnit);
        this.Scripts = dictArray(data.dict.get("f") as TagCompound, Script);
        this.Notes = data.dict.get("g")?.value;
        this.Attributions = data.dict.get("h")?.value;
        this.GlobalControlPre = data.dict.get("i");
        this.GlobalControlPost = data.dict.get("j");
    }
}

export class CPackUnit {
    Guid: string;
    Name: string;
    ObjRoot: CPackUnitModel;

    constructor(data: TagCompound) {
        this.Guid = data.dict.get("a").value;
        this.Name = data.dict.get("b").value;
        this.ObjRoot = new CPackUnitModel(data.dict.get("c") as TagCompound);
    }
}

export class CPackUnitModel {
    Name: string;
    Model: string;
    Texture: string;

    Position: Vector3;
    Rotation: Vector3;
    Scale: Vector3;

    Color: Vector4;
    ColorBrightness: number;

    Children: CPackUnitModel[];

    constructor(data: TagCompound) {
        this.Name = data.dict.get("a").value;
        this.Model = data.dict.get("b")?.value;
        this.Texture = data.dict.get("c")?.value;

        this.Position = data.dict.get("d").value;
        this.Rotation = data.dict.get("e").value;
        this.Scale = data.dict.get("f").value;
        this.Children = dictArray(data.dict.get("g") as TagCompound, CPackUnitModel);
        this.Color = data.dict.get("h").value;
        this.ColorBrightness = data.dict.get("i").value;
        // j
        // k
    }
}

export class Model {
    Name: string;
    Verts: Vector3[];
    Normals: Vector3[];
    Uvs: Vector2[];
    Inds: Int32Array;
    Colors: Vector4[];

    constructor(data: TagCompound) {
        this.Name = data.dict.get("a").value;
        this.Verts = data.dict.get("b").value;
        this.Normals = data.dict.get("c").value;
        this.Uvs = data.dict.get("d").value;
        this.Inds = data.dict.get("e").value;
        this.Colors = data.dict.get("f").value;
        // g ?
    }
}
class Texture {
    Name: string;
    Width: number;
    Height: number;
    Data: Uint8Array;

    constructor(data: TagCompound) {
        this.Name = data.dict.get("a").value;
        this.Width = data.dict.get("b").value;
        this.Height = data.dict.get("c").value;
        // d
        this.Data = data.dict.get("e").value;
        // f
    }
}
class Script {
    Name: string;
    Code: string;

    constructor(data: TagCompound) {
        this.Name = data.dict.get("a").value;
        this.Code = new TextDecoder("utf-8").decode(data.dict.get("b").value);
    }
}
interface PreScript { }
interface PostScript { }

// can be used for maps and cpacks
export function loadTag(data: Uint8Array) {
    // drop 4 bytes - uncompressed size
    let uncompressed = new Zlib.Gunzip(new Uint8Array(data.buffer, 4)).decompress() as Uint8Array;
    let reader = new Reader(uncompressed.buffer);
    let tag = new TagCompound(reader);

    /* // test Tag saving
    let writer = new Writer();
    tag.save(writer);

    writer.pos -= 1;
    let res = writer.toArray();

    if (uncompressed.length != res.length) {
        console.assert(false);
    }

    for (let i = 0; i < res.length; i++) {
        if (uncompressed[i] != res[i]) {
            console.assert(false);
            break;
        }
    }
    */

    return tag;
}

export function loadMap(data: Uint8Array) {
    return new Cw4Map(loadTag(data).dict.get("root") as TagCompound);
}

async function fetchMapList() {
    let plain = new TextDecoder("utf-8").decode(
        new Zlib.Gunzip(new Uint8Array(
            await (await fetch("https://knucklecracker.com/creeperworld4/queryMaps.php?query=maplist")).arrayBuffer()
        )).decompress()
    );

    let parser = new DOMParser();
    let doc = parser.parseFromString(plain, "text/xml");

    let list: ColonialSpace[] = [];
    for (const m of doc.firstElementChild.children) {
        if (m.tagName === "d") continue;
        list.push(new ColonialSpace(m));
    }

    return list;
}

export {
    TagCompound,
    TagList,
    ColonialSpace,
    Objective,
    fetchMapList
}

/*
function toObject(data: Tag) {
    if (data instanceof TagList) {
        return data.value.map(x => toObject(x));
    } else if (data instanceof TagCompound) {
        let obj = {};

        for (const [k, v] of data.dict) {
            obj[k] = toObject(v);
        }

        return obj;
    } else {
        return data.value;
    }
}

JSON.stringify(format(temp1), (key, value) => {
    if (value instanceof Int32Array || value instanceof Int8Array || value instanceof Uint8Array || value instanceof BigInt64Array) {
        return [...value];
    } else if (typeof value == "bigint") {
        return value.toString();
    } else {
        return value;
    }
});
*/
