//Braindead decoder that assumes fully valid input
function decodeUTF16LE(binaryStr) {
    var cp = [];
    for (var i = 0; i < binaryStr.length; i += 2) {
        cp.push(
            binaryStr.charCodeAt(i) |
            (binaryStr.charCodeAt(i + 1) << 8)
        );
    }

    return String.fromCharCode.apply(String, cp);
}

class Game {
    // UnitSettings
    public Info: Info;
    public CustomImages: CustomImage[];
    // CustomCharacters
    public Units: Unit[];
    // Ammo
    // Packets
    public Terrain: Terrain;
    // Creeper
    // Digitalis
    public Scripts: Script[];

    constructor(data: Document) {
        this.Info = new Info(data.querySelector("Info"));
        this.Terrain = new Terrain(data.querySelector("Terrain"));

        this.Units = [];
        for (const unit of data.querySelector("Units").children) {
            this.Units.push(new Unit(unit));
        }

        this.Scripts = [];
        let scripts = data.querySelector("scripts");
        if (scripts && scripts.innerHTML.trim() != "") {
            for (const item of scripts.innerHTML.split(",")) {
                this.Scripts.push(new Script(item));
            }
        }

        this.CustomImages = [];
        for (const item of data.querySelector("CustomImages").children) {
            this.CustomImages.push(new CustomImage(item));
        }
    }
}

class Info {
    public Width: number;
    public Height: number;

    public UpdateCount = 0;
    public TotemEnergy = 0;
    public Artifact0 = 0;
    public Artifact1 = 0;
    public Artifact2 = 0;
    public additionalScore = 0;
    public cnTimer0 = 0;
    public cnTimer1 = 0;
    public cnTimer2 = 0;
    public RandSeed;

    public BorderVisible = true;
    public completed = false;
    public failed = false;
    public alternateControlMode = false;
    public gameVersion = 2.12;
    public Messages: { speaker: number, message: string }[] = [];

    constructor(info: Element) {
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
    }
}

class Unit {
    public Type: string;

    // public uid: number;
    // public uc: number;
    public cX: number;
    public cY: number;
    public cZ: number;
    // public r: number;
    // b: boolean
    // en: boolean
    // ar: boolean
    // re: boolean
    // a: number
    // aa: number
    // h: number
    // mh: number
    // HER: number
    // pRS: number
    // pRTy: number
    // pRTi: number
    // pRD: number
    // pRQ: number

    public ugsw?: number;
    public ugsh?: number;

    data: Element;

    constructor(unit: Element) {
        this.data = unit;
        this.Type = unit.nodeName;

        this.cX = parseInt(unit.querySelector("cX").textContent);
        this.cY = parseInt(unit.querySelector("cY").textContent);
        this.cZ = parseInt(unit.querySelector("cZ").textContent);

        if (this.Type == "CRPLTower") {
            this.ugsw = parseInt(unit.querySelector("ugsw").textContent);
            this.ugsh = parseInt(unit.querySelector("ugsh").textContent);
        }
    }
}

class Script {
    public name: string;
    public code: string;

    constructor(data: string) {
        let [name, base64] = data.split(";");
        this.name = name;

        this.code = decodeUTF16LE(atob(base64));
    }
}

class CustomImage {
    public name: string;
    public base64: string;
    public size: number;

    constructor(item: Element) {
        let id = parseInt(item.nodeName.substring(2));
        let customName = "custom";
        if (id < 90) {
            customName += id;
            this.size = 64;
        } else if (id < 90 + 45) {
            id -= 90;
            customName += id + "_128";
            this.size = 128;
        } else if (id < 90 + 45 + 28) {
            id -= 90 + 45;
            customName += id + "_256";
            this.size = 256;
        } else if (id < 90 + 45 + 28 + 90) {
            id -= 90 + 45 + 28;
            customName += id + "pp";
            this.size = 64;
        } else if (id < 90 + 45 + 28 + 90 + 45) {
            id -= 90 + 45 + 28 + 90;
            customName += id + "_128pp";
            this.size = 128;
        } else {
            id -= 90 + 45 + 28 + 90 + 45;
            customName += id + "_256pp";
            this.size = 256;
        }

        this.name = customName;
        this.base64 = item.textContent;
    }
}

class Terrain {
    public terrain: number[];
    public walls: number[];
    public terraformLevels: number[];
    public partialTerraform: number[];

    public terrainTextures: number[];
    public terrainBrightness: number[];

    constructor(mapData: Element) {
        this.terrain = mapData.querySelector("terrain").textContent.split(",").map(x => parseInt(x));
        this.walls = mapData.querySelector("walls").textContent.split(",").map(x => parseInt(x));
        this.terraformLevels = mapData.querySelector("terraformLevels").textContent.split(",").map(x => parseInt(x));
        this.partialTerraform = mapData.querySelector("partialTerraform").textContent.split(",").map(x => parseInt(x));

        this.terrainTextures = mapData.querySelector("terrainTextures").textContent.split(",").map(x => parseInt(x));
        this.terrainBrightness = mapData.querySelector("terrainBrightness").textContent.split(",").map(x => parseInt(x));
    }
}

class ColonialSpace {
    public Id: number;
    public UnixTime: number;
    public Md5: string;
    public Author: string;
    public Name: string;
    public Width: number;
    public Height: number;
    public Description: string;

    public Downloads: number;
    public Scores: number;
    public ClearTicks: number;
    public Rating: number;
    public Ratings: number;

    constructor(data: Element) {
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

    async download(): Promise<Game> {
        let buffer = await (await fetch(`https://knucklecracker.com/creeperworld3/queryMaps.php?query=map&guid=${this.Md5}`)).arrayBuffer();

        return await new Promise(resolve => {
            decompress(buffer, resolve);
        });
    }
}

function decompress(buffer: ArrayBuffer, callback: (game: Game) => any) {
    let arr = new Uint8Array(buffer);
    
    LZMA.decompress(arr, (result) => {
        let parser = new DOMParser();
        callback(new Game(parser.parseFromString(result, "text/xml")))
    });
}

async function fetchMapList() {
    let plain = new TextDecoder("utf-8").decode(
        new Zlib.Gunzip(
            new Uint8Array(
                await (await fetch("https://knucklecracker.com/creeperworld3/queryMaps.php?query=maplist")).arrayBuffer()
            )
        ).decompress()
    );

    let parser = new DOMParser();
    let doc = parser.parseFromString(plain, "text/xml");

    let list: ColonialSpace[] = [];
    for (const m of doc.firstChild.children) {
        list.push(new ColonialSpace(m));
    }

    return list;
}

export { ColonialSpace, Game, Info, Terrain, Unit, fetchMapList, decompress }
