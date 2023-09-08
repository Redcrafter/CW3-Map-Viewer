import { Reader } from "../memory.js";
class TagBool {
    value;
    constructor(reader) {
        this.value = reader.readBool();
    }
    save(w) {
        w.writeBool(this.value);
    }
}
class TagByte {
    value;
    constructor(reader) {
        this.value = reader.readUint8();
    }
    save(w) {
        w.writeUint8(this.value);
    }
}
class TagSByte {
    value;
    constructor(reader) {
        this.value = reader.readInt8();
    }
    save(w) {
        w.writeInt8(this.value);
    }
}
class TagShort {
    value;
    constructor(reader) {
        this.value = reader.readInt16();
    }
    save(w) {
        w.writeInt16(this.value);
    }
}
class TagUShort {
    value;
    constructor(reader) {
        this.value = reader.readUint16();
    }
    save(w) {
        w.writeUint16(this.value);
    }
}
class TagInt {
    value;
    constructor(reader) {
        this.value = reader.readInt32();
    }
    save(w) {
        w.writeInt32(this.value);
    }
}
class TagUInt {
    value;
    constructor(reader) {
        this.value = reader.readUint32();
    }
    save(w) {
        w.writeUInt32(this.value);
    }
}
class TagLong {
    value;
    constructor(reader) {
        this.value = reader.readInt64();
    }
    save(w) {
        w.writeInt64(this.value);
    }
}
class TagULong {
    value;
    constructor(reader) {
        this.value = reader.readUint64();
    }
    save(w) {
        w.writeUInt64(this.value);
    }
}
class TagFloat {
    value;
    constructor(reader) {
        this.value = reader.readFloat();
    }
    save(w) {
        w.writeFloat(this.value);
    }
}
class TagDouble {
    value;
    constructor(reader) {
        this.value = reader.readDouble();
    }
    save(w) {
        w.writeDouble(this.value);
    }
}
class TagVector2 {
    value;
    constructor(reader) {
        this.value = reader.readVector2();
    }
    save(w) {
        w.writeVector2(this.value);
    }
}
class TagVector3 {
    value;
    constructor(reader) {
        this.value = reader.readVector3();
    }
    save(w) {
        w.writeVector3(this.value);
    }
}
class TagVector4 {
    value;
    constructor(reader) {
        this.value = reader.readVector4();
    }
    save(w) {
        w.writeVector4(this.value);
    }
}
class TagQuaternion {
    value;
    constructor(reader) {
        this.value = reader.readVector4();
    }
    save(w) {
        w.writeVector4(this.value);
    }
}
class TagBoolArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readBool();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeBool(this.value[i]);
        }
    }
}
class TagByteArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = reader.readBytes(length);
    }
    save(w) {
        w.writeInt32(this.value.length);
        w.writeBytes(this.value);
    }
}
class TagSByteArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Int8Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt8();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeInt8(this.value[i]);
        }
    }
}
class TagShortArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Int16Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt16();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeInt16(this.value[i]);
        }
    }
}
class TagUShortArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Uint16Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readUint16();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeUint16(this.value[i]);
        }
    }
}
class TagIntArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Int32Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt32();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeInt32(this.value[i]);
        }
    }
}
class TagUIntArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Uint32Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readUint32();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeUInt32(this.value[i]);
        }
    }
}
class TagLongArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new BigInt64Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readInt64();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeInt64(this.value[i]);
        }
    }
}
class TagULongArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new BigUint64Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readUint64();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeUInt64(this.value[i]);
        }
    }
}
class TagFloatArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readFloat();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeFloat(this.value[i]);
        }
    }
}
class TagDoubleArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Float64Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readDouble();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeDouble(this.value[i]);
        }
    }
}
class TagVector2Array {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readVector2();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeVector2(this.value[i]);
        }
    }
}
class TagVector3Array {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readVector3();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeVector3(this.value[i]);
        }
    }
}
class TagVector4Array {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readVector4();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeVector4(this.value[i]);
        }
    }
}
class TagStringArray {
    value;
    constructor(reader) {
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = reader.readString();
        }
    }
    save(w) {
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            w.writeString(this.value[i]);
        }
    }
}
class TagString {
    value;
    constructor(reader) {
        this.value = reader.readString();
    }
    save(w) {
        w.writeString(this.value);
    }
    toString() {
        return this.value;
    }
}
class TagList {
    type;
    value;
    constructor(reader) {
        this.type = reader.readUint8();
        let length = reader.readInt32();
        this.value = new Array(length);
        for (let i = 0; i < length; i++) {
            this.value[i] = readTag(reader, this.type);
        }
    }
    save(w) {
        w.writeUint8(this.type);
        w.writeInt32(this.value.length);
        for (let i = 0; i < this.value.length; i++) {
            this.value[i].save(w);
        }
    }
    search(value, path = "") {
        for (let i = 0; i < this.value.length; i++) {
            searchTag(value, this.value[i], `${path}[${i}]`);
        }
    }
}
class TagCompound {
    dict = new Map();
    constructor(reader) {
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
    save(w) {
        for (const [key, val] of this.dict) {
            w.writeUint8(getType(val));
            w.writeString(key);
            val.save(w);
        }
        w.writeUint8(0);
    }
    search(value, path = "") {
        for (const [key, val] of this.dict) {
            searchTag(value, val, `${path}->${key}`);
        }
    }
}
function searchTag(value, val, path = "") {
    if (val instanceof TagCompound || val instanceof TagList) {
        val.search(value, path);
    }
    else if (val instanceof TagString) {
        if (val.value.toLowerCase().includes(value)) {
            debugger;
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
        case 0xF7: return new TagShortArray(reader);
        case 0xF8: return new TagULong(reader);
        case 0xF9: return new TagUInt(reader);
        case 0xFA: return new TagUShort(reader);
        case 0xFB: return new TagSByte(reader);
        default:
            alert("Error: Unknown tag '" + id + "'\n Please message Redcrafter on discord or open an issue on Github");
            throw "Unknown tag";
    }
}
function getType(tag) {
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
class ColonialSpace {
    Id;
    UnixTime;
    Md5;
    Author;
    Name;
    Width;
    Height;
    Objective;
    Tags;
    Thumbs;
    Topic;
    constructor(data) {
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
    Width;
    Height;
    World;
    CPacks;
    Units;
    constructor(data) {
        this.Width = data.dict.get("cwidth").value;
        this.Height = data.dict.get("cheight").value;
        this.CPacks = data.dict.get("cpacks")?.value.map(x => new CPack(x));
        this.World = new World(data.dict.get("world"));
        this.Units = data.dict.get("units").value.map(x => new Unit(x));
    }
}
class Unit {
    Guid;
    Id;
    Position;
    constructor(data) {
        this.Guid = data.dict.get("a").value;
        this.Id = data.dict.get("b").value;
        this.Position = data.dict.get("ua").value;
    }
}
class World {
    Theme;
    Terrain;
    constructor(data) {
        this.Theme = new Theme(data.dict.get("theme"));
        this.Terrain = data.dict.get("t").value;
    }
}
class Theme {
    TextureId;
    TextureColor;
    TextureIntensity;
    TextureScales;
    Normals;
    NormalsIntensity;
    NormalsScale;
    WallTexture;
    WallColor;
    WallScale;
    constructor(data) {
        this.TextureId = data.dict.get("b").value;
        this.TextureScales = data.dict.get("c").value;
        this.TextureColor = data.dict.get("e").value;
        this.Normals = data.dict.get("f").value;
        this.NormalsIntensity = data.dict.get("g").value;
        this.NormalsScale = data.dict.get("h").value;
        this.WallTexture = data.dict.get("j").value;
        this.WallScale = data.dict.get("k").value;
        this.WallColor = data.dict.get("l").value;
        this.TextureIntensity = data.dict.get("p").value;
    }
}
function dictArray(data, ctor) {
    if (!data)
        return null;
    let res = [];
    for (const [key, val] of data.dict) {
        res[parseInt(key)] = new ctor(val);
    }
    return res;
}
export class CPack {
    Guid;
    Name;
    Models;
    Textures;
    Units;
    Scripts;
    Notes;
    Attributions;
    GlobalControlPre;
    GlobalControlPost;
    constructor(data) {
        this.Guid = data.dict.get("a").value;
        this.Name = data.dict.get("b").value;
        this.Models = dictArray(data.dict.get("c"), Model);
        this.Textures = dictArray(data.dict.get("d"), Texture);
        this.Units = dictArray(data.dict.get("e"), CPackUnit);
        this.Scripts = dictArray(data.dict.get("f"), Script);
        this.Notes = data.dict.get("g")?.value;
        this.Attributions = data.dict.get("h")?.value;
        this.GlobalControlPre = data.dict.get("i");
        this.GlobalControlPost = data.dict.get("j");
    }
}
export class CPackUnit {
    Guid;
    Name;
    ObjRoot;
    constructor(data) {
        this.Guid = data.dict.get("a").value;
        this.Name = data.dict.get("b").value;
        this.ObjRoot = new CPackUnitModel(data.dict.get("c"));
    }
}
export class CPackUnitModel {
    Name;
    Model;
    Texture;
    Position;
    Rotation;
    Scale;
    Color;
    ColorBrightness;
    Children;
    constructor(data) {
        this.Name = data.dict.get("a").value;
        this.Model = data.dict.get("b")?.value;
        this.Texture = data.dict.get("c")?.value;
        this.Position = data.dict.get("d").value;
        this.Rotation = data.dict.get("e").value;
        this.Scale = data.dict.get("f").value;
        this.Children = dictArray(data.dict.get("g"), CPackUnitModel);
        this.Color = data.dict.get("h").value;
        this.ColorBrightness = data.dict.get("i").value;
    }
}
export class Model {
    Name;
    Verts;
    Normals;
    Uvs;
    Inds;
    Colors;
    constructor(data) {
        this.Name = data.dict.get("a").value;
        this.Verts = data.dict.get("b").value;
        this.Normals = data.dict.get("c").value;
        this.Uvs = data.dict.get("d").value;
        this.Inds = data.dict.get("e").value;
        this.Colors = data.dict.get("f").value;
    }
}
class Texture {
    Name;
    Width;
    Height;
    Data;
    constructor(data) {
        this.Name = data.dict.get("a").value;
        this.Width = data.dict.get("b").value;
        this.Height = data.dict.get("c").value;
        this.Data = data.dict.get("e").value;
    }
}
class Script {
    Name;
    Code;
    constructor(data) {
        this.Name = data.dict.get("a").value;
        this.Code = new TextDecoder("utf-8").decode(data.dict.get("b").value);
    }
}
export function loadTag(data) {
    let uncompressed = new Zlib.Gunzip(new Uint8Array(data.buffer, 4)).decompress();
    let reader = new Reader(uncompressed.buffer);
    let tag = new TagCompound(reader);
    return tag;
}
export function loadMap(data) {
    return new Cw4Map(loadTag(data).dict.get("root"));
}
async function fetchMapList() {
    let plain = new TextDecoder("utf-8").decode(new Zlib.Gunzip(new Uint8Array(await (await fetch("https://knucklecracker.com/creeperworld4/queryMaps.php?query=maplist")).arrayBuffer())).decompress());
    let parser = new DOMParser();
    let doc = parser.parseFromString(plain, "text/xml");
    let list = [];
    for (const m of doc.firstElementChild.children) {
        if (m.tagName === "d")
            continue;
        list.push(new ColonialSpace(m));
    }
    return list;
}
export { TagCompound, TagList, ColonialSpace, fetchMapList };
