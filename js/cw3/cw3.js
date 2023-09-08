function decodeUTF16LE(binaryStr) {
    var cp = [];
    for (var i = 0; i < binaryStr.length; i += 2) {
        cp.push(binaryStr.charCodeAt(i) |
            (binaryStr.charCodeAt(i + 1) << 8));
    }
    return String.fromCharCode(...cp);
}
function encodeUTF16LE(str) {
    let out = [];
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        out.push(code & 0xFF, (code >> 8) & 0xFF);
    }
    return String.fromCharCode(...out);
}
class Game {
    UnitSettings;
    Info;
    CustomImages;
    CustomCharacters;
    Units;
    Ammo;
    Packets;
    Terrain;
    Creeper;
    Digitalis;
    Scripts;
    constructor(data) {
        this.UnitSettings = data.querySelector("UnitSettings");
        this.CustomCharacters = data.querySelector("CustomCharacters");
        this.Ammo = data.querySelector("Ammo");
        this.Packets = data.querySelector("Packets");
        this.Creeper = data.querySelector("Creeper");
        this.Digitalis = data.querySelector("Digitalis");
        this.Info = new Info(data.querySelector("Info"));
        this.Terrain = new Terrain(data.querySelector("Terrain"));
        this.Units = [];
        for (const unit of data.querySelector("Units").children) {
            this.Units.push(new Unit(unit));
        }
        this.Scripts = [];
        let scripts = data.querySelector("scripts");
        if (scripts && scripts.textContent.trim() != "") {
            for (const item of scripts.textContent.split(",")) {
                this.Scripts.push(new Script(item));
            }
        }
        this.CustomImages = [];
        for (const item of data.querySelector("CustomImages").children) {
            this.CustomImages.push(new CustomImage(item));
        }
    }
    save(doc) {
        let game = doc.createElement("Game");
        game.append(this.UnitSettings);
        game.append(this.Info.save(doc));
        game.append(saveArray(doc, "CustomImages", this.CustomImages));
        game.append(this.CustomCharacters);
        game.append(saveArray(doc, "Units", this.Units));
        game.append(this.Ammo);
        game.append(this.Packets);
        game.append(this.Terrain.save(doc));
        game.append(this.Creeper);
        game.append(this.Digitalis);
        let Scripts = doc.createElement("Scripts");
        let scripts = doc.createElement("scripts");
        scripts.innerHTML = this.Scripts.map(x => `${x.name};${btoa(encodeUTF16LE(x.code))}`).join(",");
        Scripts.append(scripts);
        game.append(Scripts);
        doc.append(game);
    }
}
class Info {
    Width;
    Height;
    UpdateCount = 0;
    TotemEnergy = 0;
    Artifact0 = 0;
    Artifact1 = 0;
    Artifact2 = 0;
    additionalScore;
    cnTimer0 = 0;
    cnTimer1 = 0;
    cnTimer2 = 0;
    RandSeed;
    BorderVisible = true;
    completed = false;
    failed = false;
    alternateControlMode = false;
    gameVersion = 2.12;
    Messages = [];
    unitHasBeenDamaged;
    constructor(info) {
        this.Width = parseInt(info.querySelector("Width").textContent);
        this.Height = parseInt(info.querySelector("Height").textContent);
        this.UpdateCount = parseInt(info.querySelector("UpdateCount").textContent);
        this.TotemEnergy = parseInt(info.querySelector("TotemEnergy").textContent);
        this.Artifact0 = parseInt(info.querySelector("Artifact0").textContent);
        this.Artifact1 = parseInt(info.querySelector("Artifact1").textContent);
        this.Artifact2 = parseInt(info.querySelector("Artifact2").textContent);
        if (info.querySelector("additionalScore")) {
            this.additionalScore = parseInt(info.querySelector("additionalScore").textContent);
        }
        this.cnTimer0 = parseInt(info.querySelector("cnTimer0").textContent);
        this.cnTimer1 = parseInt(info.querySelector("cnTimer1").textContent);
        this.cnTimer2 = parseInt(info.querySelector("cnTimer2").textContent);
        this.RandSeed = parseInt(info.querySelector("RandSeed").textContent);
        this.BorderVisible = info.querySelector("BorderVisible").textContent == "True";
        this.completed = info.querySelector("completed").textContent == "True";
        this.failed = info.querySelector("failed").textContent == "True";
        this.alternateControlMode = info.querySelector("alternateControlMode").textContent == "True";
        if (info.querySelector("gameVersion")) {
            this.gameVersion = parseFloat(info.querySelector("gameVersion").textContent);
        }
        let messages = info.querySelector("Messages");
        if (messages) {
            for (const m of messages.children) {
                this.Messages.push({
                    speaker: parseInt(m.querySelector("c").textContent),
                    message: m.querySelector("m").textContent
                });
            }
        }
        if (info.querySelector("unitHasBeenDamaged")) {
            this.unitHasBeenDamaged = info.querySelector("unitHasBeenDamaged").textContent == "True";
        }
    }
    save(doc) {
        let info = doc.createElement("Info");
        function add(val, name) {
            if (val === undefined)
                return;
            let el = doc.createElement(name);
            if (typeof val == "boolean") {
                el.textContent = val ? "True" : "False";
            }
            else {
                el.textContent = val.toString();
            }
            info.append(el);
        }
        add(this.Width, "Width");
        add(this.Height, "Height");
        add(this.UpdateCount, "UpdateCount");
        add(this.TotemEnergy, "TotemEnergy");
        add(this.Artifact0, "Artifact0");
        add(this.Artifact1, "Artifact1");
        add(this.Artifact2, "Artifact2");
        add(this.additionalScore, "additionalScore");
        add(this.cnTimer0, "cnTimer0");
        add(this.cnTimer1, "cnTimer1");
        add(this.cnTimer2, "cnTimer2");
        add(this.RandSeed, "RandSeed");
        add(this.BorderVisible, "BorderVisible");
        add(this.completed, "completed");
        add(this.failed, "failed");
        add(this.alternateControlMode, "alternateControlMode");
        add(this.gameVersion, "gameVersion");
        if (this.Messages.length != 0) {
            let el = doc.createElement("Messages");
            for (const message of this.Messages) {
                let n = doc.createElement("Message");
                let c = doc.createElement("c");
                c.textContent = message.speaker.toString();
                let m = doc.createElement("m");
                m.textContent = message.message;
                n.append(c, m);
                el.append(n);
            }
            info.append(el);
        }
        add(this.unitHasBeenDamaged, "unitHasBeenDamaged");
        return info;
    }
}
class Unit {
    Type;
    cX;
    cY;
    cZ;
    ugsw;
    ugsh;
    data;
    constructor(unit) {
        this.data = unit;
        this.Type = unit.nodeName;
        this.cX = parseFloat(unit.querySelector("cX").textContent);
        this.cY = parseFloat(unit.querySelector("cY").textContent);
        this.cZ = parseFloat(unit.querySelector("cZ").textContent);
        if (this.Type == "CRPLTower") {
            this.ugsw = parseFloat(unit.querySelector("ugsw").textContent);
            this.ugsh = parseFloat(unit.querySelector("ugsh").textContent);
        }
    }
    save(doc) {
        let el = this.data.cloneNode(true);
        el.querySelector("cX").textContent = this.cX.toString();
        el.querySelector("cY").textContent = this.cY.toString();
        el.querySelector("cZ").textContent = this.cZ.toString();
        if (this.Type == "CRPLTower") {
            el.querySelector("ugsw").textContent = this.ugsw.toString();
            el.querySelector("ugsh").textContent = this.ugsh.toString();
        }
        return el;
    }
    getNum(name) {
        return parseFloat(this.data.querySelector(name).textContent);
    }
    getVal(name) {
        return this.data.querySelector(name)?.textContent;
    }
    getTup(name) {
        let text = this.data.querySelector(name).textContent;
        return text.substring(1, text.length - 1).split(",").map(parseFloat);
    }
}
class Script {
    name;
    code;
    constructor(data) {
        let [name, base64] = data.split(";");
        this.name = name;
        this.code = decodeUTF16LE(atob(base64));
    }
}
class CustomImage {
    name;
    base64;
    size;
    data;
    constructor(item) {
        this.data = item;
        let id = parseInt(item.nodeName.substring(2));
        let customName = "custom";
        if (id < 90) {
            customName += id;
            this.size = 64;
        }
        else if (id < 90 + 45) {
            id -= 90;
            customName += id + "_128";
            this.size = 128;
        }
        else if (id < 90 + 45 + 28) {
            id -= 90 + 45;
            customName += id + "_256";
            this.size = 256;
        }
        else if (id < 90 + 45 + 28 + 90) {
            id -= 90 + 45 + 28;
            customName += id + "pp";
            this.size = 64;
        }
        else if (id < 90 + 45 + 28 + 90 + 45) {
            id -= 90 + 45 + 28 + 90;
            customName += id + "_128pp";
            this.size = 128;
        }
        else {
            id -= 90 + 45 + 28 + 90 + 45;
            customName += id + "_256pp";
            this.size = 256;
        }
        this.name = customName;
        this.base64 = item.textContent;
    }
    save(doc) {
        return this.data.cloneNode(true);
    }
}
class Terrain {
    terrain;
    walls;
    terraformLevels;
    partialTerraform;
    terrainTextures;
    terrainBrightness;
    custer;
    constructor(mapData) {
        this.terrain = splitArray(mapData.querySelector("terrain").textContent);
        this.walls = splitArray(mapData.querySelector("walls").textContent);
        this.terraformLevels = splitArray(mapData.querySelector("terraformLevels").textContent);
        this.partialTerraform = splitArray(mapData.querySelector("partialTerraform").textContent);
        this.terrainTextures = splitArray(mapData.querySelector("terrainTextures").textContent);
        this.terrainBrightness = splitArray(mapData.querySelector("terrainBrightness").textContent);
        if (mapData.querySelector("custer")) {
            this.custer = atob(mapData.querySelector("custer").textContent);
        }
    }
    save(doc) {
        let el = doc.createElement("Terrain");
        el.append(fromArray(doc, "terrain", this.terrain));
        el.append(fromArray(doc, "walls", this.walls));
        el.append(fromArray(doc, "terraformLevels", this.terraformLevels));
        el.append(fromArray(doc, "partialTerraform", this.partialTerraform));
        el.append(fromArray(doc, "terrainTextures", this.terrainTextures));
        el.append(fromArray(doc, "terrainBrightness", this.terrainBrightness));
        if (this.custer) {
            let a = doc.createElement("custer");
            a.textContent = btoa(this.custer);
            el.append(a);
        }
        return el;
    }
}
class ColonialSpace {
    Id;
    UnixTime;
    Md5;
    Author;
    Name;
    Width;
    Height;
    Description;
    Downloads;
    Scores;
    ClearTicks;
    Rating;
    Ratings;
    constructor(data) {
        this.Id = parseFloat(data.querySelector("i").textContent);
        this.UnixTime = parseFloat(data.querySelector("t").textContent);
        this.Md5 = data.querySelector("g").textContent;
        this.Author = data.querySelector("a").textContent;
        this.Name = data.querySelector("l").textContent;
        this.Width = parseFloat(data.querySelector("w").textContent);
        this.Height = parseFloat(data.querySelector("h").textContent);
        this.Description = data.querySelector("e").textContent;
        this.Downloads = parseFloat(data.querySelector("o").textContent);
        this.Scores = parseFloat(data.querySelector("s").textContent);
        this.ClearTicks = parseFloat(data.querySelector("d").textContent);
        this.Rating = parseFloat(data.querySelector("r").textContent);
        this.Ratings = parseFloat(data.querySelector("n").textContent);
    }
    get imageUrl() {
        return `https://knucklecracker.com/creeperworld3/queryMaps.php?query=thumbnail&guid=${this.Md5}`;
    }
    async download() {
        let buffer = await (await fetch(`https://knucklecracker.com/creeperworld3/queryMaps.php?query=map&guid=${this.Md5}`)).arrayBuffer();
        return await decompress(buffer);
    }
}
function splitArray(text) {
    return text.split(",").map(x => parseInt(x));
}
function fromArray(doc, name, elements) {
    let el = doc.createElement(name);
    el.textContent = elements.join(",");
    return el;
}
function saveArray(doc, name, elements) {
    let el = doc.createElement(name);
    for (const item of elements) {
        el.append(item.save(doc));
    }
    return el;
}
function compare(a, b) {
    if (a.tagName != b.tagName || a.children.length != b.children.length) {
        debugger;
        return false;
    }
    if (a.children.length == 0) {
        if (a.textContent !== b.textContent)
            debugger;
        return a.textContent === b.textContent;
    }
    else {
        for (let i = 0; i < a.children.length; i++) {
            if (!compare(a.children[i], b.children[i])) {
                return false;
            }
        }
    }
    return true;
}
async function decompress(buffer) {
    let arr = new Uint8Array(buffer);
    let result = await new Promise(r => LZMA.decompress(arr, r));
    let parser = new DOMParser();
    let el = parser.parseFromString(result, "text/xml");
    let g = new Game(el);
    return g;
}
function compress(game) {
    let doc = document.implementation.createDocument("", "");
    game.save(doc);
    let serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(doc);
    return new Promise(resolve => LZMA.compress(xmlString, 6, resolve));
}
async function fetchMapList() {
    let plain = new TextDecoder("utf-8").decode(new Zlib.Gunzip(new Uint8Array(await (await fetch("https://knucklecracker.com/creeperworld3/queryMaps.php?query=maplist")).arrayBuffer())).decompress());
    let parser = new DOMParser();
    let doc = parser.parseFromString(plain, "text/xml");
    let list = [];
    for (const m of doc.firstElementChild.children) {
        list.push(new ColonialSpace(m));
    }
    return list;
}
export { ColonialSpace, Game, Info, Terrain, Unit, fetchMapList, decompress, compress };
