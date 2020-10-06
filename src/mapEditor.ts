import { Game } from "./cw3.js";
import { produceHighlighted } from "./highlighter.js";
import { loadTexture, addObject, RenderObject, canvasInfo, startRenderLoop, FontAtlas } from "./rendering.js";

let mapEditor = {
    display(display: boolean) {
        document.getElementById("mapEditor").style.display = display ? "" : "none";
    },
    loadMap(md5: ArrayBuffer) {
        let arr = new Uint8Array(md5);

        LZMA.decompress(arr, (result) => {
            let parser = new DOMParser();
            LoadStuff(new Game(parser.parseFromString(result, "text/xml")));
        });
    },
    onClose: () => { },
};


// let fileInput: HTMLInputElement;
let images: HTMLDivElement;
// let canvas: HTMLCanvasElement;

let hoverInfo: HTMLSpanElement;

let inputW: HTMLInputElement;
let inputH: HTMLInputElement;

// let context: CanvasRenderingContext2D;

let currentMap: Game;
// let customTextures: Map<string, HTMLImageElement>;
let drawUnits = true;

let fontAtlas: FontAtlas;


let objects: {
    bg: RenderObject,
    mapParent: RenderObject,
    units: RenderObject[],
    hoverText: RenderObject[]
} = {};

let actions = [
    /*{
        elementName: "flipV",
        action: () => {
            let w = Math.floor(currentMap.Info.Width / 2);
            let ter = currentMap.Terrain.terrain;

            for (let y = 0; y < currentMap.Info.Height; y++) {
                let row = y * currentMap.Info.Width;
                for (let x = 0; x < w; x++) {
                    [ter[x + row], ter[currentMap.Info.Width - x - 1 + row]] = [ter[currentMap.Info.Width - x - 1 + row], ter[x + row]];
                }
            }

            for (const unit of currentMap.Units) {
                unit.cX = (currentMap.Info.Width - 1) * 8 - unit.cX;
            }

            updateData();
        }
    }, {
        elementName: "flipH",
        action: () => {
            let h = Math.floor(currentMap.Info.Height / 2);
            let ter = currentMap.Terrain.terrain;

            for (let y = 0; y < h; y++) {
                let t = y * currentMap.Info.Width;
                let b = (currentMap.Info.Height - y - 1) * currentMap.Info.Width;

                for (let x = 0; x < currentMap.Info.Width; x++) {
                    [ter[x + t], ter[x + b]] = [ter[x + b], ter[x + t]];
                }
            }

            for (const unit of currentMap.Units) {
                unit.cY = (currentMap.Info.Height - 1) * 8 - unit.cX;
            }

            updateData();
        }
    }, {
        elementName: "rotR",
        action: () => {
            let ter = currentMap.Terrain.terrain;

            let newTer = new Array(currentMap.Terrain.terrain.length);

            for (let y = 0; y < currentMap.Info.Height; y++) {
                for (let x = 0; x < currentMap.Info.Width; x++) {
                    newTer[(currentMap.Info.Height - y - 1) + x * currentMap.Info.Height] = ter[x + y * currentMap.Info.Width];
                }
            }

            for (const unit of currentMap.Units) {
                [unit.cX, unit.cY] = [currentMap.Info.Height - unit.cY - 1, unit.cX];
            }

            currentMap.Terrain.terrain = newTer;
            [currentMap.Info.Width, currentMap.Info.Height] = [currentMap.Info.Height, currentMap.Info.Width];
            updateData();
        }
    }, {
        elementName: "rotL",
        action: () => {
            let ter = currentMap.Terrain.terrain;

            let newTer = new Array(currentMap.Terrain.terrain.length);

            for (let y = 0; y < currentMap.Info.Height; y++) {
                for (let x = 0; x < currentMap.Info.Width; x++) {
                    newTer[y + (currentMap.Info.Width - x - 1) * currentMap.Info.Height] = ter[x + y * currentMap.Info.Width];
                }
            }

            for (const unit of currentMap.Units) {
                [unit.cX, unit.cY] = [unit.cY, currentMap.Info.Width - unit.cX - 1];
            }

            currentMap.Terrain.terrain = newTer;
            [currentMap.Info.Width, currentMap.Info.Height] = [currentMap.Info.Height, currentMap.Info.Width];
            updateData();
        }
    }, {
        elementName: "invTer",
        action: () => {
            let ter = currentMap.Terrain.terrain;

            for (let y = 0; y < currentMap.Info.Height; y++) {
                for (let x = 0; x < currentMap.Info.Width; x++) {
                    let val = ter[x + y * currentMap.Info.Width];
                    if (val != 500) {
                        ter[x + y * currentMap.Info.Width] = 9 - val;
                    }
                }
            }

            updateData();
        }
    }, {
        elementName: "invTex",
        action: () => {
            let ter = currentMap.Terrain;

            ter.terrainTextures = ter.terrainTextures.reverse();
            ter.terrainBrightness = ter.terrainBrightness.reverse();

            updateData();
        }
    },*/ {
        elementName: "hideUnits",
        action: () => {
            drawUnits = !drawUnits;
            for (const unit of objects.units) {
                unit.visible = drawUnits;
            }

            updateData();
        }
    }, /*{
        elementName: "resize",
        action: () => {
            let w = parseInt(inputW.value);
            let h = parseInt(inputH.value);

            let newTer = new Array(w * h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (x < currentMap.Info.Width && y < currentMap.Info.Height) {
                        newTer[x + y * w] = currentMap.Terrain.terrain[x + y * w];
                    } else {
                        newTer[x + y * w] = 500;
                    }
                }
            }

            currentMap.Terrain.terrain = newTer;
            currentMap.Info.Width = w;
            currentMap.Info.Height = h;

            updateData();
        }
    }, {
        elementName: "scale",
        action: () => {
            // let w = parseInt(resizeInput.value);
            // let h = parseInt(resizeInput.value);
        }
    }*/
]

function updateData() {
    // TODO: update map mesh
}

document.addEventListener("DOMContentLoaded", () => {
    images = document.getElementById("images") as HTMLDivElement;

    hoverInfo = document.getElementById("hoverInfo") as HTMLSpanElement;

    inputW = document.getElementById("inputW") as HTMLInputElement;
    inputH = document.getElementById("inputH") as HTMLInputElement;

    for (const item of actions) {
        let el = document.getElementById(item.elementName);
        el.addEventListener("click", () => {
            item.action();
        })
    }
});

let mainTabWindow = document.getElementById("mainTabWindow");
let topTabBar = document.getElementById("topTabBar");
// let topTabs: { topEl: HTMLElement, main: HTMLElement }[] = [];
let currentTopTab: { topEl: HTMLElement, main: HTMLElement } = null;


let leftTabs = {
    general: {
        button: document.getElementById("generalTabButton"),
        tab: document.getElementById("generalTab")
    },
    script: {
        button: document.getElementById("scriptTabButton"),
        tab: document.getElementById("scriptTab")
    },
    image: {
        button: document.getElementById("imageTabButton"),
        tab: document.getElementById("imageTab")
    },
}

leftTabs.general.button.addEventListener("click", () => {
    leftTabs.general.tab.style.display = "";
    leftTabs.script.tab.style.display = "none";
    leftTabs.image.tab.style.display = "none";
});
leftTabs.script.button.addEventListener("click", () => {
    leftTabs.general.tab.style.display = "none";
    leftTabs.script.tab.style.display = "";
    leftTabs.image.tab.style.display = "none";
});
leftTabs.image.button.addEventListener("click", () => {
    leftTabs.general.tab.style.display = "none";
    leftTabs.script.tab.style.display = "none";
    leftTabs.image.tab.style.display = "";
});

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

canvasInfo.canvas.addEventListener("mousemove", (e) => {
    mouseX = (e.offsetX - objects.mapParent.position.x) / objects.mapParent.scale.x;
    mouseY = (e.offsetY - objects.mapParent.position.y) / objects.mapParent.scale.y;

    let x = Math.floor(mouseX);
    let y = Math.floor(mouseY);

    if (x < 0 || x >= currentMap.Info.Width || y < 0 || y >= currentMap.Info.Height) {
        hoverInfo.innerText = "Height: N/A";
    } else {
        hoverInfo.innerText = `Height: ${currentMap.Terrain.terrain[x + y * currentMap.Info.Width]}`;
    }
});
canvasInfo.canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
});
document.addEventListener("mouseup", (e) => {
    mouseDown = false;
});
document.addEventListener("mousemove", (e) => {
    if (mouseDown) {
        objects.mapParent.position.x += e.movementX;
        objects.mapParent.position.y += e.movementY;

        let x = objects.mapParent.position.x;
        let y = objects.mapParent.position.y;

        for (const item of objects.hoverText) {
            item.position.x = x;
            item.position.y = y;
        }
    }
});



function parseTup(text: string) {
    text = text.substring(1, text.length - 1);

    return text.split(",").map(parseFloat);
}

function genMapMesh(map: Game) {
    let terrain = map.Terrain.terrain;
    let width = map.Info.Width;
    let height = map.Info.Height;

    let vertices = [];
    let uvs = [];
    let colors = [];

    // number of sub tiles for texture wrap
    const subTiles = 32;

    function getUV(x: number, y: number, texture: number) {
        const pixelW = 1 / 2048;
        const pixelH = 1 / 4096;

        let x1 = (texture % 8) / 8;
        let y1;

        if (texture < 64) {
            y1 = (7 - Math.floor(texture / 8)) / 16;
        } else {
            y1 = (7 - Math.floor((texture - 64) / 8) + 8) / 16;
        }

        x1 += (x % subTiles) / (subTiles * 8);
        y1 += (y % subTiles) / (subTiles * 16);

        let w = 1 / (subTiles * 8);
        let h = 1 / (subTiles * 16);

        let x2 = x1 + w;
        let y2 = y1 + h;

        // https://gamedev.stackexchange.com/questions/46963/how-to-avoid-texture-bleeding-in-a-texture-atlas
        x1 += pixelW / 2;
        y1 += pixelH / 2;
        x2 -= pixelW / 2;
        y2 -= pixelH / 2;

        return {
            tl: [x1, y1],
            tr: [x2, y1],
            bl: [x1, y2],
            br: [x2, y2],
            x: x1,
            y: y1,
            w, h
        }
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const h = terrain[x + y * width];

            if (h == 500) {
                continue;
            }

            // let brightness = map.Terrain.terrainBrightness[h];
            let mainUv = getUV(x, y, map.Terrain.terrainTextures[h]);
            let brightness = map.Terrain.terrainBrightness[h] / 50;

            const l = x == 0 ? h : terrain[x - 1 + y * width];
            const r = x + 1 == width ? h : terrain[x + 1 + y * width];
            const t = y == 0 ? h : terrain[x + (y - 1) * width];
            const b = y + 1 == height ? h : terrain[x + (y + 1) * width];

            // xxx
            // x x
            // xxx
            if (l > h && l == r && l == t && l == b) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;

                if (l != 500) {
                    vertices.push(
                        x, y,
                        x + 0.5, y,
                        x, y + 0.5,

                        x + 0.5, y,
                        x + 1, y,
                        x + 1, y + 0.5,

                        x + 1, y + 0.5,
                        x + 1, y + 1,
                        x + 0.5, y + 1,

                        x + 0.5, y + 1,
                        x, y + 1,
                        x, y + 0.5,
                    );

                    uvs.push(
                        ...lUv.tl,
                        lUv.x + lUv.w / 2, lUv.y,
                        lUv.x, lUv.y + lUv.h / 2,

                        lUv.x + lUv.w / 2, lUv.y,
                        ...lUv.tr,
                        lUv.x + lUv.w, lUv.y + lUv.h / 2,

                        lUv.x + lUv.w, lUv.y + lUv.h / 2,
                        ...lUv.br,
                        lUv.x + lUv.w / 2, lUv.y + lUv.h,

                        lUv.x + lUv.w / 2, lUv.y + lUv.h,
                        ...lUv.bl,
                        lUv.x, lUv.y + lUv.h / 2,
                    );

                    colors.push(
                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,

                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,

                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,

                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,
                    );
                }

                vertices.push(
                    x, y + 0.5,
                    x + 0.5, y,
                    x + 0.5, y + 1,

                    x + 0.5, y,
                    x + 1, y + 0.5,
                    x + 0.5, y + 1,
                );

                uvs.push(
                    mainUv.x, mainUv.y + mainUv.h / 2,
                    mainUv.x + mainUv.w / 2, mainUv.y,
                    mainUv.x + mainUv.w / 2, mainUv.y + mainUv.h,

                    mainUv.x + mainUv.w / 2, mainUv.y,
                    mainUv.x + mainUv.w, mainUv.y + mainUv.h / 2,
                    mainUv.x + mainUv.w / 2, mainUv.y + mainUv.h,
                );

                colors.push(
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,

                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                );

                continue;
            }

            // xxx
            // x x
            if (l > h && l == r && l == t) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;

                if (l != 500) {
                    vertices.push(
                        x, y,
                        x + 0.5, y,
                        x, y + 1,

                        x + 0.5, y,
                        x + 1, y,
                        x + 1, y + 1
                    );

                    uvs.push(
                        ...lUv.tl,
                        lUv.x + lUv.w / 2, lUv.y,
                        ...lUv.bl,

                        lUv.x + lUv.w / 2, lUv.y,
                        ...lUv.tr,
                        ...lUv.br
                    );

                    colors.push(
                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,

                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,
                    );
                }

                vertices.push(
                    x, y + 1,
                    x + 0.5, y,
                    x + 1, y + 1,
                );

                uvs.push(
                    ...mainUv.bl,
                    mainUv.x + mainUv.w / 2, mainUv.y,
                    ...mainUv.br,
                );

                colors.push(
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                );
                continue;
            }

            // xx
            // x
            // xx
            if (l > h && l == b && l == t) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;

                if (l != 500) {
                    vertices.push(
                        x, y,
                        x + 1, y,
                        x, y + 0.5,

                        x, y + 0.5,
                        x + 1, y + 1,
                        x, y + 1
                    );

                    uvs.push(
                        ...lUv.tl,
                        ...lUv.tr,
                        lUv.x, lUv.y + lUv.h / 2,

                        lUv.x, lUv.y + lUv.h / 2,
                        ...lUv.br,
                        ...lUv.bl,
                    );

                    colors.push(
                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,

                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,
                    );
                }

                vertices.push(
                    x + 1, y,
                    x + 1, y + 1,
                    x, y + 0.5,
                );

                uvs.push(
                    ...mainUv.tr,
                    ...mainUv.br,
                    mainUv.x, mainUv.y + mainUv.h / 2,
                );

                colors.push(
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                );
                continue;
            }

            // x x
            // xxx
            if (l > h && l == b && l == r) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;

                if (l != 500) {
                    vertices.push(
                        x, y,
                        x + 0.5, y + 1,
                        x, y + 1,

                        x + 0.5, y + 1,
                        x + 1, y,
                        x + 1, y + 1
                    );

                    uvs.push(
                        ...lUv.tl,
                        lUv.x + lUv.w / 2, lUv.y + lUv.h,
                        ...lUv.bl,

                        lUv.x + lUv.w / 2, lUv.y + lUv.h,
                        ...lUv.tr,
                        ...lUv.br,
                    );

                    colors.push(
                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,

                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,
                    );
                }

                vertices.push(
                    x, y,
                    x + 1, y,
                    x + 0.5, y + 1,
                );

                uvs.push(
                    ...mainUv.tl,
                    ...mainUv.tr,
                    mainUv.x + mainUv.w / 2, mainUv.y + mainUv.h,
                );

                colors.push(
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                );


                continue;
            }

            // xx
            //  x
            // xx
            if (r > h && r == b && r == t) {
                let rUv = getUV(x, y, map.Terrain.terrainTextures[r]);
                let b = map.Terrain.terrainBrightness[r] / 50;

                if (r != 500) {
                    vertices.push(
                        x, y,
                        x + 1, y,
                        x + 1, y + 0.5,

                        x + 1, y + 0.5,
                        x + 1, y + 1,
                        x, y + 1
                    );

                    uvs.push(
                        ...rUv.tl,
                        ...rUv.tr,
                        rUv.x + rUv.w, rUv.y + rUv.h / 2,

                        rUv.x + rUv.w, rUv.y + rUv.h / 2,
                        ...rUv.br,
                        ...rUv.bl,
                    );

                    colors.push(
                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,

                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,
                    );
                }

                vertices.push(
                    x, y,
                    x + 1, y + 0.5,
                    x, y + 1,
                );

                uvs.push(
                    ...mainUv.tl,
                    mainUv.x + mainUv.w, mainUv.y + mainUv.h / 2,
                    ...mainUv.bl,
                );

                colors.push(
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                );

                continue;
            }

            // xx
            // x 
            if (l > h && l == t) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;

                if (l != 500) {
                    vertices.push(x, y,
                        x + 1, y,
                        x, y + 1,
                    );

                    uvs.push(
                        ...lUv.tl,
                        ...lUv.tr,
                        ...lUv.bl
                    );

                    colors.push(
                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,
                    );
                }

                vertices.push(
                    x + 1, y,
                    x + 1, y + 1,
                    x, y + 1,
                );

                uvs.push(
                    ...mainUv.tr,
                    ...mainUv.br,
                    ...mainUv.bl,
                );

                colors.push(
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                );

                continue;
            }

            // xx
            //  x
            if (r > h && r == t) {
                let rUv = getUV(x, y, map.Terrain.terrainTextures[r]);
                let b = map.Terrain.terrainBrightness[r] / 50;

                if (r != 500) {
                    vertices.push(
                        x, y,
                        x + 1, y,
                        x + 1, y + 1
                    );

                    uvs.push(
                        ...rUv.tl,
                        ...rUv.tr,
                        ...rUv.br
                    );

                    colors.push(
                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,
                    );
                }

                vertices.push(
                    x, y,
                    x + 1, y + 1,
                    x, y + 1,
                );

                uvs.push(
                    ...mainUv.tl,
                    ...mainUv.br,
                    ...mainUv.bl,
                );

                colors.push(
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                );

                continue;
            }

            // x 
            // xx
            if (l > h && l == b) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;

                if (l != 500) {
                    vertices.push(
                        x, y,
                        x + 1, y + 1,
                        x, y + 1,
                    );

                    uvs.push(
                        ...lUv.tl,
                        ...lUv.br,
                        ...lUv.bl
                    );

                    colors.push(
                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,
                    );
                }

                vertices.push(
                    x, y,
                    x + 1, y,
                    x + 1, y + 1,
                );

                uvs.push(
                    ...mainUv.tl,
                    ...mainUv.tr,
                    ...mainUv.br,
                );

                colors.push(
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                );
                continue;
            }

            //  x
            // xx
            if (r > h && r == b) {
                let rUv = getUV(x, y, map.Terrain.terrainTextures[r]);
                let b = map.Terrain.terrainBrightness[r] / 50;

                if (r != 500) {
                    vertices.push(
                        x + 1, y,
                        x + 1, y + 1,
                        x, y + 1
                    );

                    uvs.push(
                        ...rUv.tr,
                        ...rUv.br,
                        ...rUv.bl
                    );

                    colors.push(
                        b, b, b, 1,
                        b, b, b, 1,
                        b, b, b, 1,
                    );
                }

                vertices.push(
                    x, y,
                    x + 1, y,
                    x, y + 1,
                );

                uvs.push(
                    ...mainUv.tl,
                    ...mainUv.tr,
                    ...mainUv.bl,
                );

                colors.push(
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                    brightness, brightness, brightness, 1,
                );

                continue;
            }

            vertices.push(
                x, y,
                x + 1, y,
                x, y + 1,

                x + 1, y,
                x + 1, y + 1,
                x, y + 1,
            );

            uvs.push(
                ...mainUv.tl,
                ...mainUv.tr,
                ...mainUv.bl,

                ...mainUv.tr,
                ...mainUv.br,
                ...mainUv.bl,
            );

            colors.push(
                brightness, brightness, brightness, 1,
                brightness, brightness, brightness, 1,
                brightness, brightness, brightness, 1,

                brightness, brightness, brightness, 1,
                brightness, brightness, brightness, 1,
                brightness, brightness, brightness, 1
            );
        }
    }

    return {
        vertices,
        uvs,
        colors
    };
}

const centerRect = [
    -0.5, -0.5,
    0.5, -0.5,
    -0.5, 0.5,

    0.5, -0.5,
    -0.5, 0.5,
    0.5, 0.5
];
// 1x1 rect
const rect = [
    0, 0,
    1, 0,
    0, 1,

    1, 0,
    0, 1,
    1, 1
];
const rectColor = [
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,

    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
]

function selectTopTab(el) {
    if (currentTopTab) {
        currentTopTab.topEl.removeAttribute("active");
        currentTopTab.main.removeAttribute("active");
    }

    el.topEl.setAttribute("active", "");
    el.main.setAttribute("active", "");
    currentTopTab = el;
}

function addTab(options: {
    name: string,
    mainEl?: HTMLElement,
    closeAble?: boolean,
    onClose?: () => void
}) {
    let topEl = document.createElement("div");
    let title = document.createElement("div");

    title.classList.add("title");
    title.innerText = options.name;
    topEl.appendChild(title);

    if (options.closeAble !== false) {
        let close = document.createElement("div");
        close.classList.add("close");
        close.innerText = "x";
        topEl.appendChild(close);

        function closeTab() {
            if (!options.mainEl) {
                mainTabWindow.removeChild(main);
            }
            if (options.onClose) {
                options.onClose();
            }

            if (currentTopTab == el) {
                // using click to select last open tab
                // bit hacky but fuck it
                if (topEl.previousSibling) {
                    topEl.previousSibling.click();
                    // selectTopTab(topEl.previousSibling);
                } else if (topTabBar.children.length > 0) {
                    // selectTopTab(topTabBar.children[0]);
                    topTabBar.children[0].click();
                }
            }

            topTabBar.removeChild(topEl);
        }
        close.addEventListener("click", () => {
            closeTab();
            return true;
        })
        topEl.addEventListener("mouseup", (e) => {
            if (e.button == 1) {
                closeTab();
            }
        })
    }

    topTabBar.appendChild(topEl);

    let main: HTMLElement;
    if (options.mainEl) {
        main = options.mainEl;
    } else {
        main = document.createElement("div");
        mainTabWindow.appendChild(main);
    }

    let el = {
        topEl,
        main
    };

    topEl.addEventListener("click", () => {
        selectTopTab(el);
    });

    selectTopTab(el);

    return main;
}

function createImgEl(src) {
    let img = document.createElement("img");
    img.src = src;
    return img;
}

let defaultTextures = new Map<string, string>([
    ["customemitter", "customemitter.png"],
    ["customrunnernest", "runner.png"],
    ["default", "default.png"],
    ["customsporetower", "customSpore.png"],

    ["sporeTop", "sporeTop.png"],

    ["commandNode", "cn.png"],
    ["Reactor", "reactor.png"],
    ["Emitter", "customemitter.png"], // temporary
    ["Siphon", "siphon.png"],
    ["Totem", "totem.png"],
    ["ResourcePack", "resource.png"],
    ["OreDeposit", "oreDeposit.png"],
    ["OreDepositBg", "oreDepositBg.png"],

    ["Collector", "collector.png"],
    ["Relay", "relay.png"],
    ["Terp", "terp.png"],
    ["Mortar", "mortar.png"],
    ["PulseCannon", "cannon_default.png"],
    ["ParticleBeam", "beam.png"],
    ["OreMine", "oremine.png"],
    ["Sprayer", "sprayer.png"],

    ["PowerZone", "power.png"]
]);

async function LoadStuff(game: Game) {
    if (!objects.bg) {
        canvasInfo.canvas.addEventListener("wheel", (e) => {
            let factor;
            if (e.deltaY < 0) {
                // up
                factor = 1.1;
            } else {
                // Down
                factor = 1 / 1.1;
            }

            objects.mapParent.scale.x *= factor;
            objects.mapParent.scale.y *= factor;

            objects.mapParent.position.x = factor * (objects.mapParent.position.x - e.offsetX) + e.offsetX;
            objects.mapParent.position.y = factor * (objects.mapParent.position.y - e.offsetY) + e.offsetY;
        });

        objects.bg = new RenderObject(rect, rect, rectColor);
        objects.bg.position.z = -2;
        objects.bg.texture = loadTexture("./img/purple-nebula_front5.png");
        objects.bg.onUpdate = () => {
            if (objects.bg.scale.x != canvasInfo.width) {
                objects.bg.scale.x = canvasInfo.width;
            }
            if (objects.bg.scale.y != canvasInfo.height) {
                objects.bg.scale.y = canvasInfo.height;
            }
        }
        addObject(objects.bg);

        objects.mapParent = new RenderObject();
        objects.mapParent.scale.x = 10;
        objects.mapParent.scale.y = 10;

        fontAtlas = await FontAtlas.createFont("aldrich_regular_64", 587, 574);
    }

    //#region Load game data

    currentMap = game;

    for (const item of actions) {
        document.getElementById(item.elementName).disabled = false;
    }

    inputW.value = game.Info.Width.toString();
    inputH.value = game.Info.Height.toString();
    // inputW.disabled = false;
    // inputH.disabled = false;

    //#endregion

    let customTextures = new Map<string, { el: HTMLImageElement, tex?: WebGLTexture }>();

    function makeUnit(x: number, y: number, z: number, name: string, color: [number, number, number, number]) {
        let obj = new RenderObject(centerRect, rect, [
            ...color,
            ...color,
            ...color,

            ...color,
            ...color,
            ...color,
        ]);

        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;

        obj.scale.x = 3;
        obj.scale.y = 3;

        let img = customTextures.get(name);
        if (!img.tex) {
            img.tex = loadTexture(img.el);
        }
        obj.texture = img.tex;
        obj.parent = objects.mapParent;

        objects.units.push(obj);
        addObject(obj);
    }

    function makeHoverText(x: number, y: number, w: number, h: number, text: string) {
        // trim all lines
        text = text.split("\n").map(x => x.trim()).join("\n");

        let ret = fontAtlas.createTextObject(text, 1, true);

        let obj = ret.obj;
        obj.position.x = x - ret.width / 2;
        obj.position.y = y - ret.height;
        obj.position.z = 9;
        obj.parent = objects.mapParent;
        obj.onUpdate = () => {
            obj.visible =
                mouseX > (x - w / 2) &&
                mouseX < (x + w / 2) &&
                mouseY > (y - h / 2) &&
                mouseY < (y + h / 2);

            let s = objects.mapParent.scale.x / 5;

            obj.scale.x = 1 / s;
            obj.scale.y = 1 / s;

            obj.position.x = x - (ret.width / 2) / s;
            obj.position.y = y - (ret.height) / s;
        }

        objects.hoverText.push(obj);
        addObject(obj);
    }

    for (const [name, file] of defaultTextures) {
        customTextures.set(name, { el: createImgEl(`./img/${file}`) })
    }

    // Load images
    while (images.firstChild) { images.removeChild(images.firstChild); }
    for (const item of game.CustomImages) {
        let el = document.createElement("div");
        el.classList.add("customImage", `x${item.size}`);

        let img = createImgEl("data:image/png;base64, " + item.base64);

        customTextures.set(item.name, {
            el: img,
        });

        let name = document.createElement("p");
        name.innerText = item.name;

        el.appendChild(name);
        el.appendChild(img);
        images.appendChild(el);
    }

    let mesh = genMapMesh(game);
    let mapObj = new RenderObject(mesh.vertices, mesh.uvs, mesh.colors);
    mapObj.parent = objects.mapParent;
    mapObj.position.z = -1;
    mapObj.texture = loadTexture("./img/atlas3-64textures.png");
    addObject(mapObj);

    // objects.map = mapObj;

    objects.hoverText = [];
    objects.units = [];
    for (const unit of currentMap.Units) {
        let cx = unit.cX / 8;
        let cy = currentMap.Info.Height - unit.cY / 8;
        let cz = -unit.cZ / 8;

        switch (unit.Type) {
            case "Emitter": {
                let st = unit.data.querySelector("sT"); // sleep time??
                let ft = unit.data.querySelector("fT"); // idk
                let interval = parseInt(unit.data.querySelector("pI").textContent);
                let amount = parseInt(unit.data.querySelector("pBA").textContent) / 1000000;

                makeUnit(cx, cy, cz, unit.Type, [1, 1, 1, 1]);
                makeHoverText(cx, cy, 3, 3, `Amt: ${amount}\nInterval: ${interval / 30}`)
                break;
            }
            case "OreDeposit":
                makeUnit(cx, cy, cz, "OreDepositBg", [1, 1, 1, 1]);
                makeUnit(cx, cy, cz, "OreDeposit", [1, 1, 1, 1]);
                break;
            case "SporeTower": {
                let initialDelay = parseInt(unit.data.querySelector("stid").textContent);
                let waveDelay = parseInt(unit.data.querySelector("stwi").textContent);
                let sporeCount = parseInt(unit.data.querySelector("stwc").textContent);
                let sporePayload = parseInt(unit.data.querySelector("stsp").textContent);

                makeUnit(cx, cy, cz, "customsporetower", [1, 1, 1, 1]);

                let text;
                if (initialDelay > currentMap.Info.UpdateCount) {
                    // still building
                    text = `Build: ${Math.floor((currentMap.Info.UpdateCount / initialDelay) * 100)}%`;
                } else {
                    // done building
                    let time = ((currentMap.Info.UpdateCount - initialDelay) % waveDelay) / 30;
                    text = `${Math.floor(time / 60)}:${Math.floor(time % 60)}%`;
                    makeUnit(cx, cy, cz, "sporeTop", [0.5, 0.5, 1, 1]);
                }
                let asdf = fontAtlas.createTextObject(text, 0.5);

                let obj = asdf.obj;
                obj.position.x = cx - asdf.width / 2;
                obj.position.y = cy - 2;
                obj.position.z = 9;
                obj.parent = objects.mapParent;
                addObject(obj);

                makeHoverText(cx, cy, 3, 3, `${1} Spores`);

                break;
            }
            case "Siphon":
            case "Reactor":
            case "Totem":
            case "Collector":
            case "Relay":
            case "Terp":
            case "Mortar":
            case "PulseCannon":
            case "ParticleBeam":
            case "OreMine":
            case "PowerZone":
            case "Sprayer":
                makeUnit(cx, cy, cz, unit.Type, [1, 1, 1, 1]);
                break;
            case "ResourcePack": {
                let color: [number, number, number, number];
                switch (parseInt(unit.data.querySelector("rprt").innerHTML)) {
                    case 0: // Energy green
                        color = [0, 1, 0, 1];
                        break;
                    case 1: // Ore    brown
                        color = [191 / 255, 127 / 255, 63 / 255, 1];
                        break;
                    case 2: // Aether white
                        color = [1, 1, 1, 1];
                        break;
                }
                makeUnit(cx, cy, cz, unit.Type, color);
                break;
            }
            case "CommandNode": {
                let obj = new RenderObject(centerRect, rect, rectColor);

                obj.position.x = cx;
                obj.position.y = cy;
                obj.position.z = cz;

                // 3 times normal units size
                obj.scale.x = 9;
                obj.scale.y = 9;

                let img = customTextures.get("commandNode");
                if (!img.tex) {
                    img.tex = loadTexture(img.el);
                }
                obj.texture = img.tex;
                obj.parent = objects.mapParent;

                objects.units.push(obj);
                addObject(obj);

                break;
            }
            case "CRPLTower": {
                let hoverText = unit.data.querySelector("put_t");
                if (hoverText) {
                    makeHoverText(cx, cy, unit.ugsw, unit.ugsh, hoverText.textContent);
                }

                let constText = unit.data.querySelector("tem_t");

                if (constText && constText.innerHTML.trim() != "") {
                    let size = parseFloat(unit.data.querySelector("tem_s").innerHTML) / 100;
                    let color = parseTup(unit.data.querySelector("tem_c").innerHTML);
                    let x = parseFloat(unit.data.querySelector("tem_x").innerHTML) / 8;
                    let y = parseFloat(unit.data.querySelector("tem_y").innerHTML) / 8;
                    let anchor = parseInt(unit.data.querySelector("tem_a").innerHTML)

                    let asdf = fontAtlas.createTextObject(constText.innerHTML, size, false, color);

                    let obj = asdf.obj;
                    obj.position.x = cx + x;
                    obj.position.y = cy - y;
                    obj.position.z = 9;
                    obj.parent = objects.mapParent;

                    switch (anchor) {
                        case 1: // UpperCenter
                        case 4: // MiddleCenter
                        case 7: // LowerCenter
                            obj.position.x -= asdf.width / 2;
                            break;
                        case 2: // UpperRight
                        case 5: // MiddleRight
                        case 8: // LowerRight
                            obj.position.x -= asdf.width;
                            break;
                    }

                    switch (anchor) {
                        case 3: // MiddleLeft
                        case 4: // MiddleCenter
                        case 5: // MiddleRight
                            obj.position.y -= asdf.height / 2;
                            break;
                        case 6: // LowerLeft
                        case 7: // LowerCenter
                        case 8: // LowerRight
                            obj.position.y -= asdf.height;
                            break;
                    }

                    addObject(obj);
                }

                for (const item of unit.data.querySelector("si").textContent.split(",")) {
                    let [slot, text] = item.split(";");
                    text = text.toLowerCase();
                    if (text == "none") {
                        continue;
                    }

                    let loc = parseTup(unit.data.querySelector(`OD ${slot}-l`).textContent);
                    let scale = parseTup(unit.data.querySelector(`OD ${slot}-s`).textContent);
                    let rot = parseTup(unit.data.querySelector(`OD ${slot}-r`).textContent)[2];
                    let color = parseTup(unit.data.querySelector(`OD ${slot}-c`).textContent);

                    let img = customTextures.get(text);
                    if (!img) {
                        console.error("Missing texture", text);
                        continue;
                    }

                    let w = 3 * scale[0];
                    let h = 3 * scale[1];

                    let obj = new RenderObject(centerRect, rect, [
                        ...color,
                        ...color,
                        ...color,

                        ...color,
                        ...color,
                        ...color,
                    ]);
                    obj.position.x = cx + loc[0] / 8;
                    obj.position.y = cy + loc[1] / 8;
                    obj.position.z = cz - loc[2];

                    obj.scale.x = w;
                    obj.scale.y = h;

                    obj.rotation = rot * Math.PI / 180;

                    if (!img.tex) {
                        img.tex = loadTexture(img.el);
                    }
                    obj.texture = img.tex;
                    obj.parent = objects.mapParent;

                    objects.units.push(obj);
                    addObject(obj);
                }
                break;
            }
            default:
                console.log("Unknown type", unit.Type);
                break;
        }

    }

    addTab({
        name: "Map Editor",
        closeAble: false,
        mainEl: document.getElementById("canvasContainer")
    });

    for (const item of game.Scripts) {
        let node = document.createElement("div");
        node.innerText = item.name;

        let tab: HTMLElement;
        node.addEventListener("click", () => {
            if (!tab) {
                tab = addTab({
                    name: item.name,
                    onClose: () => {
                        tab = null;
                    }
                });
                tab.classList.add("crplCode");

                let highlight = document.createElement("div");
                produceHighlighted(item.code, highlight);

                tab.appendChild(highlight);
            }
        });

        leftTabs.script.tab.appendChild(node);
    }

    startRenderLoop();
}


export { mapEditor }