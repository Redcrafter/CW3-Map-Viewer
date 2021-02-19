import { compress } from "./cw3.js";
import { createOrtho } from "./matrix.js";
import { FontAtlas, loadTexture, Mesh, Renderer, RenderObject, ShaderProgram } from "./rendering.js";
import { produceHighlighted } from "./highlighter.js";
import { addTab, leftTabs } from "./mapEditor.js";
const white = [1, 1, 1, 1];
const centerRect = [
    -0.5, -0.5,
    0.5, -0.5,
    -0.5, 0.5,
    0.5, -0.5,
    -0.5, 0.5,
    0.5, 0.5
];
const rect = [
    0, 0,
    1, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1
];
const rectColor = [
    ...white,
    ...white,
    ...white,
    ...white,
    ...white,
    ...white,
];
let defaultTextures = new Map([
    ["customemitter", "customemitter.png"],
    ["customrunnernest", "runner.png"],
    ["default", "default.png"],
    ["customsporetower", "customSpore.png"],
    ["sporeTop", "sporeTop.png"],
    ["commandNode", "cn.png"],
    ["Reactor", "reactor.png"],
    ["Emitter", "customemitter.png"],
    ["Siphon", "siphon.png"],
    ["Totem", "totem.png"],
    ["ResourcePack", "resource.png"],
    ["OreDeposit", "oreDeposit.png"],
    ["OreDepositBg", "oreDepositBg.png"],
    ["Collector", "collector.png"],
    ["Relay", "relay.png"],
    ["TerraPod", "terp.png"],
    ["Mortar", "mortar.png"],
    ["PulseCannon", "cannon_default.png"],
    ["ParticleBeam", "beam.png"],
    ["OreMine", "oremine.png"],
    ["Sprayer", "sprayer.png"],
    ["ShieldGenerator", "shield.png"],
    ["Sniper", "sniper.png"],
    ["Nullifier", "nullifier.png"],
    ["AETower", "AETower.png"],
    ["Inhibitor", "inhibitor.png"],
    ["Bertha", "bertha.png"],
    ["Thor", "thor.png"],
    ["Numen", "forge.png"],
    ["SupplyDroneLandingPad", "guppy_pad.png"],
    ["SupplyDrone", "guppy.png"],
    ["StrafeDroneLandingPad", "strafer_pad.png"],
    ["StrafeDrone", "strafer.png"],
    ["BomberDroneLandingPad", "bomber_pad.png"],
    ["BomberDrone", "bomber.png"],
    ["MessageArtifact", "message.png"],
    ["ShieldKey", "key.png"],
    ["TechArtifact", "tech.png"],
    ["Freeze", "aoo_freeze.png"],
    ["Mass", "aoo_mass.png"],
    ["Convert", "aoo_convert.png"],
    ["PowerZone", "power.png"]
]);
function genMapMesh(map) {
    let terrain = map.Terrain.terrain;
    let width = map.Info.Width;
    let height = map.Info.Height;
    let vertices = [];
    let uvs = [];
    let colors = [];
    const subTiles = 32;
    const tileSize = 256 / subTiles;
    const atlasWidth = 2064;
    const atlasHeight = 4128;
    function getUV(x, y, texture) {
        texture = Math.min(texture, 127);
        let x1 = (texture % 8) * 258 + 1 + (x % subTiles) * tileSize;
        let y1 = Math.floor(texture / 8) * 258 + 1 + (y % subTiles) * tileSize;
        let x2 = x1 + tileSize;
        let y2 = y1 + tileSize;
        x1 /= atlasWidth;
        y1 /= atlasHeight;
        x2 /= atlasWidth;
        y2 /= atlasHeight;
        return {
            tl: [x1, y1],
            tr: [x2, y1],
            bl: [x1, y2],
            br: [x2, y2],
            x: x1,
            y: y1,
            w: tileSize / atlasWidth,
            h: tileSize / atlasHeight
        };
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const h = terrain[x + y * width];
            if (h == 500) {
                continue;
            }
            let mainUv = getUV(x, y, map.Terrain.terrainTextures[h]);
            let brightness = map.Terrain.terrainBrightness[h] / 50;
            const l = x == 0 ? h : terrain[x - 1 + y * width];
            const r = x + 1 == width ? h : terrain[x + 1 + y * width];
            const t = y == 0 ? h : terrain[x + (y - 1) * width];
            const b = y + 1 == height ? h : terrain[x + (y + 1) * width];
            if (l > h && l == r && l == t && l == b) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;
                if (l != 500) {
                    vertices.push(x, y, x + 0.5, y, x, y + 0.5, x + 0.5, y, x + 1, y, x + 1, y + 0.5, x + 1, y + 0.5, x + 1, y + 1, x + 0.5, y + 1, x + 0.5, y + 1, x, y + 1, x, y + 0.5);
                    uvs.push(...lUv.tl, lUv.x + lUv.w / 2, lUv.y, lUv.x, lUv.y + lUv.h / 2, lUv.x + lUv.w / 2, lUv.y, ...lUv.tr, lUv.x + lUv.w, lUv.y + lUv.h / 2, lUv.x + lUv.w, lUv.y + lUv.h / 2, ...lUv.br, lUv.x + lUv.w / 2, lUv.y + lUv.h, lUv.x + lUv.w / 2, lUv.y + lUv.h, ...lUv.bl, lUv.x, lUv.y + lUv.h / 2);
                    colors.push(b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1);
                }
                vertices.push(x, y + 0.5, x + 0.5, y, x + 0.5, y + 1, x + 0.5, y, x + 1, y + 0.5, x + 0.5, y + 1);
                uvs.push(mainUv.x, mainUv.y + mainUv.h / 2, mainUv.x + mainUv.w / 2, mainUv.y, mainUv.x + mainUv.w / 2, mainUv.y + mainUv.h, mainUv.x + mainUv.w / 2, mainUv.y, mainUv.x + mainUv.w, mainUv.y + mainUv.h / 2, mainUv.x + mainUv.w / 2, mainUv.y + mainUv.h);
                colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
                continue;
            }
            if (l > h && l == r && l == t) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;
                if (l != 500) {
                    vertices.push(x, y, x + 0.5, y, x, y + 1, x + 0.5, y, x + 1, y, x + 1, y + 1);
                    uvs.push(...lUv.tl, lUv.x + lUv.w / 2, lUv.y, ...lUv.bl, lUv.x + lUv.w / 2, lUv.y, ...lUv.tr, ...lUv.br);
                    colors.push(b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1);
                }
                vertices.push(x, y + 1, x + 0.5, y, x + 1, y + 1);
                uvs.push(...mainUv.bl, mainUv.x + mainUv.w / 2, mainUv.y, ...mainUv.br);
                colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
                continue;
            }
            if (l > h && l == b && l == t) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;
                if (l != 500) {
                    vertices.push(x, y, x + 1, y, x, y + 0.5, x, y + 0.5, x + 1, y + 1, x, y + 1);
                    uvs.push(...lUv.tl, ...lUv.tr, lUv.x, lUv.y + lUv.h / 2, lUv.x, lUv.y + lUv.h / 2, ...lUv.br, ...lUv.bl);
                    colors.push(b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1);
                }
                vertices.push(x + 1, y, x + 1, y + 1, x, y + 0.5);
                uvs.push(...mainUv.tr, ...mainUv.br, mainUv.x, mainUv.y + mainUv.h / 2);
                colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
                continue;
            }
            if (l > h && l == b && l == r) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;
                if (l != 500) {
                    vertices.push(x, y, x + 0.5, y + 1, x, y + 1, x + 0.5, y + 1, x + 1, y, x + 1, y + 1);
                    uvs.push(...lUv.tl, lUv.x + lUv.w / 2, lUv.y + lUv.h, ...lUv.bl, lUv.x + lUv.w / 2, lUv.y + lUv.h, ...lUv.tr, ...lUv.br);
                    colors.push(b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1);
                }
                vertices.push(x, y, x + 1, y, x + 0.5, y + 1);
                uvs.push(...mainUv.tl, ...mainUv.tr, mainUv.x + mainUv.w / 2, mainUv.y + mainUv.h);
                colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
                continue;
            }
            if (r > h && r == b && r == t) {
                let rUv = getUV(x, y, map.Terrain.terrainTextures[r]);
                let b = map.Terrain.terrainBrightness[r] / 50;
                if (r != 500) {
                    vertices.push(x, y, x + 1, y, x + 1, y + 0.5, x + 1, y + 0.5, x + 1, y + 1, x, y + 1);
                    uvs.push(...rUv.tl, ...rUv.tr, rUv.x + rUv.w, rUv.y + rUv.h / 2, rUv.x + rUv.w, rUv.y + rUv.h / 2, ...rUv.br, ...rUv.bl);
                    colors.push(b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1, b, b, b, 1);
                }
                vertices.push(x, y, x + 1, y + 0.5, x, y + 1);
                uvs.push(...mainUv.tl, mainUv.x + mainUv.w, mainUv.y + mainUv.h / 2, ...mainUv.bl);
                colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
                continue;
            }
            if (l > h && l == t) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;
                if (l != 500) {
                    vertices.push(x, y, x + 1, y, x, y + 1);
                    uvs.push(...lUv.tl, ...lUv.tr, ...lUv.bl);
                    colors.push(b, b, b, 1, b, b, b, 1, b, b, b, 1);
                }
                vertices.push(x + 1, y, x + 1, y + 1, x, y + 1);
                uvs.push(...mainUv.tr, ...mainUv.br, ...mainUv.bl);
                colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
                continue;
            }
            if (r > h && r == t) {
                let rUv = getUV(x, y, map.Terrain.terrainTextures[r]);
                let b = map.Terrain.terrainBrightness[r] / 50;
                if (r != 500) {
                    vertices.push(x, y, x + 1, y, x + 1, y + 1);
                    uvs.push(...rUv.tl, ...rUv.tr, ...rUv.br);
                    colors.push(b, b, b, 1, b, b, b, 1, b, b, b, 1);
                }
                vertices.push(x, y, x + 1, y + 1, x, y + 1);
                uvs.push(...mainUv.tl, ...mainUv.br, ...mainUv.bl);
                colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
                continue;
            }
            if (l > h && l == b) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);
                let b = map.Terrain.terrainBrightness[l] / 50;
                if (l != 500) {
                    vertices.push(x, y, x + 1, y + 1, x, y + 1);
                    uvs.push(...lUv.tl, ...lUv.br, ...lUv.bl);
                    colors.push(b, b, b, 1, b, b, b, 1, b, b, b, 1);
                }
                vertices.push(x, y, x + 1, y, x + 1, y + 1);
                uvs.push(...mainUv.tl, ...mainUv.tr, ...mainUv.br);
                colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
                continue;
            }
            if (r > h && r == b) {
                let rUv = getUV(x, y, map.Terrain.terrainTextures[r]);
                let b = map.Terrain.terrainBrightness[r] / 50;
                if (r != 500) {
                    vertices.push(x + 1, y, x + 1, y + 1, x, y + 1);
                    uvs.push(...rUv.tr, ...rUv.br, ...rUv.bl);
                    colors.push(b, b, b, 1, b, b, b, 1, b, b, b, 1);
                }
                vertices.push(x, y, x + 1, y, x, y + 1);
                uvs.push(...mainUv.tl, ...mainUv.tr, ...mainUv.bl);
                colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
                continue;
            }
            vertices.push(x, y, x + 1, y, x, y + 1, x + 1, y, x + 1, y + 1, x, y + 1);
            uvs.push(...mainUv.tl, ...mainUv.tr, ...mainUv.bl, ...mainUv.tr, ...mainUv.br, ...mainUv.bl);
            colors.push(brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1, brightness, brightness, brightness, 1);
        }
    }
    return { vertices, uvs, colors };
}
function parseTup(text) {
    text = text.substring(1, text.length - 1);
    return text.split(",").map(parseFloat);
}
function createImgEl(src) {
    let img = document.createElement("img");
    img.src = src;
    return img;
}
function download(data, filename) {
    let file = new Blob([data]);
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, filename);
    }
    else {
        let a = document.createElement("a");
        let url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
export class cw3MapViewer extends Renderer {
    async init() {
        let hoverInfo = document.createElement("span");
        hoverInfo.innerText = "Height: N/A";
        hoverInfo.id = "hoverInfo";
        let canvasContainer = document.getElementById("canvasContainer");
        canvasContainer.insertBefore(hoverInfo, canvasContainer.firstChild);
        this.canvas.addEventListener("mousemove", (e) => {
            if (!this.game)
                return;
            let mouseX = (e.offsetX - this.mapParent.position.x) / this.mapParent.scale.x;
            let mouseY = (e.offsetY - this.mapParent.position.y) / this.mapParent.scale.y;
            let x = Math.floor(mouseX);
            let y = Math.floor(mouseY);
            if (x < 0 || x >= this.game.Info.Width || y < 0 || y >= this.game.Info.Height) {
                hoverInfo.innerText = "Height: N/A";
            }
            else {
                let h = this.game.Terrain.terrain[x + y * this.game.Info.Width];
                hoverInfo.innerText = `Height: ${h == 500 ? "void" : h}`;
            }
        });
        let mouseDown = false;
        this.canvas.addEventListener("mousedown", () => {
            mouseDown = true;
        });
        document.addEventListener("mouseup", (e) => {
            mouseDown = false;
        });
        document.addEventListener("mousemove", (e) => {
            if (mouseDown) {
                this.mapParent.position.x += e.movementX;
                this.mapParent.position.y += e.movementY;
            }
        });
        this.canvas.addEventListener("wheel", (e) => {
            let factor;
            if (e.deltaY < 0) {
                factor = 1.1;
            }
            else {
                factor = 1 / 1.1;
            }
            this.mapParent.scale.x *= factor;
            this.mapParent.scale.y *= factor;
            this.mapParent.position.x = factor * (this.mapParent.position.x - e.offsetX) + e.offsetX;
            this.mapParent.position.y = factor * (this.mapParent.position.y - e.offsetY) + e.offsetY;
        });
        this.elements = createElements([
            hyperscript("button", { onclick: () => this.flipVertical() }, "Flip vertically"),
            hyperscript("button", { onclick: () => this.flipHorizontal() }, "Flip horizontally"),
            hyperscript("button", { onclick: () => this.rotateR() }, "Rotate right"),
            hyperscript("button", { onclick: () => this.rotateL() }, "Rotate left"),
            hyperscript("button", { onclick: () => this.invTer() }, "Invert terrain"),
            hyperscript("button", { onclick: () => this.invTex() }, "Invert textures"),
            hyperscript("div", null,
                hyperscript("input", { type: "checkbox", oninput: (e) => this.unitParent.visible = !e.target.checked }),
                hyperscript("label", null, "Hide units")),
            hyperscript("div", null,
                hyperscript("label", null, "Width: "),
                hyperscript("input", { type: "number", id: "inputW", min: "1", max: "512" }),
                hyperscript("br", null),
                hyperscript("label", null, "Height:"),
                hyperscript("input", { type: "number", id: "inputH", min: "1", max: "512" }),
                hyperscript("br", null),
                hyperscript("button", { onclick: () => this._resize(), title: "Resize the map without changing map data" }, "Resize"),
                hyperscript("button", { onclick: () => this.scale(), title: "Stretch the map to the specified size" }, "Scale")),
            hyperscript("button", { onclick: () => this.save() }, "Save")
        ]);
        leftTabs.general.tab.append(...this.elements);
        let vsSource;
        let fsSource;
        let gl = this.gl;
        let atlasPromise = FontAtlas.createFont(gl, "./aldrich_regular_64", 587, 574);
        await Promise.all([
            fetch("./shaders/cw3.vs").then(x => x.text()).then(x => vsSource = x),
            fetch("./shaders/cw3.fs").then(x => x.text()).then(x => fsSource = x)
        ]);
        this.shader = new ShaderProgram(gl, vsSource, fsSource);
        this.shader.vertexSize = 2;
        this.shader.use();
        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        this.resize(this.container.clientWidth, this.container.clientHeight);
        this.fontAtlas = await atlasPromise;
        this.bg = new RenderObject(new Mesh(this.shader, rect, rect, rectColor));
        this.bg.position.z = -2;
        this.bg.texture = loadTexture(this.gl, "./img/purple-nebula_front5.png");
        this.bg.onUpdate = () => {
            this.bg.scale.x = this.width;
            this.bg.scale.y = this.height;
        };
        this.root.add(this.bg);
        this.mapParent = new RenderObject();
        this.mapParent.scale.x = 10;
        this.mapParent.scale.y = 10;
        this.root.add(this.mapParent);
        this.unitParent = new RenderObject();
        this.unitParent.parent = this.mapParent;
    }
    createProjection() {
        return createOrtho(0, this.width, 0, this.height, 10, -10);
    }
    loadMap(game) {
        this.game = game;
        this.elements[7].children[1].value = game.Info.Width.toString();
        this.elements[7].children[4].value = game.Info.Height.toString();
        let customTextures = new Map();
        for (const [name, file] of defaultTextures) {
            customTextures.set(name, { el: createImgEl(`./img/${file}`) });
        }
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
            leftTabs.image.images.appendChild(el);
        }
        this.customTextures = customTextures;
        this.createUnits();
        let mapObj = new RenderObject();
        mapObj.parent = this.mapParent;
        this.mapParent.children.reverse();
        this.updateMesh();
        mapObj.position.z = -1;
        mapObj.texture = loadTexture(this.gl, "./img/testAtlas.png");
        addTab({
            name: "Map Editor",
            closeAble: false,
            mainEl: document.getElementById("canvasContainer")
        });
        for (const item of game.Scripts) {
            let node = document.createElement("div");
            node.innerText = item.name;
            let tab;
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
        this.start();
    }
    async save() {
        let dat = await compress(this.game);
        download(new Uint8Array(dat), "save.cw3");
    }
    createUnits() {
        let ref = this;
        function makeUnit(x, y, z, size, name, color) {
            let obj = new RenderObject(new Mesh(ref.shader, centerRect, rect, [
                ...color,
                ...color,
                ...color,
                ...color,
                ...color,
                ...color,
            ]));
            obj.position.x = x;
            obj.position.y = y;
            obj.position.z = z;
            obj.scale.x = size;
            obj.scale.y = size;
            let img = ref.customTextures.get(name);
            if (!img.tex) {
                img.tex = loadTexture(ref.gl, img.el);
            }
            obj.texture = img.tex;
            obj.parent = ref.unitParent;
            return obj;
        }
        function makeHoverText(x, y, w, h, text) {
            text = text.split("\n").map(x => x.trim()).join("\n");
            let ret = ref.fontAtlas.createTextObject(ref.shader, text, 1, true);
            let obj = ret.obj;
            obj.position.x = x - ret.width / 2;
            obj.position.y = y - ret.height;
            obj.position.z = 9;
            obj.parent = ref.unitParent;
            obj.onUpdate = () => {
                let mouseX = (ref.mouseX - ref.mapParent.position.x) / ref.mapParent.scale.x;
                let mouseY = (ref.mouseY - ref.mapParent.position.y) / ref.mapParent.scale.y;
                obj.visible =
                    mouseX > (x - w / 2) &&
                        mouseX < (x + w / 2) &&
                        mouseY > (y - h / 2) &&
                        mouseY < (y + h / 2);
                let s = ref.mapParent.scale.x / 5;
                obj.scale.x = 1 / s;
                obj.scale.y = 1 / s;
                obj.position.x = x - (ret.width / 2) / s;
                obj.position.y = y - (ret.height) / s;
            };
        }
        let game = this.game;
        for (const unit of game.Units) {
            let cx = unit.cX / 8;
            let cy = game.Info.Height - unit.cY / 8;
            let cz = -unit.cZ / 8;
            switch (unit.Type) {
                case "Emitter": {
                    let st = unit.data.querySelector("sT");
                    let ft = unit.data.querySelector("fT");
                    let interval = parseInt(unit.data.querySelector("pI").textContent);
                    let amount = parseInt(unit.data.querySelector("pBA").textContent) / 1000000;
                    makeUnit(cx, cy, cz, 3, unit.Type, white);
                    makeHoverText(cx, cy, 3, 3, `Amt: ${amount}\nInterval: ${interval / 30}`);
                    break;
                }
                case "OreDeposit":
                    makeUnit(cx, cy, cz, 4, "OreDepositBg", white);
                    makeUnit(cx, cy, cz, 4, "OreDeposit", white);
                    break;
                case "SporeTower": {
                    let initialDelay = parseInt(unit.data.querySelector("stid").textContent);
                    let waveDelay = parseInt(unit.data.querySelector("stwi").textContent);
                    let sporeCount = parseInt(unit.data.querySelector("stwc").textContent);
                    let sporePayload = parseInt(unit.data.querySelector("stsp").textContent);
                    makeUnit(cx, cy, cz, 3, "customsporetower", white);
                    let text;
                    if (initialDelay > game.Info.UpdateCount) {
                        text = `Build: ${Math.floor((game.Info.UpdateCount / initialDelay) * 100)}%`;
                    }
                    else {
                        let time = ((game.Info.UpdateCount - initialDelay) % waveDelay) / 30;
                        text = `${Math.floor(time / 60)}:${Math.floor(time % 60)}%`;
                        makeUnit(cx, cy, cz, 3, "sporeTop", [0.5, 0.5, 1, 1]);
                    }
                    let asdf = this.fontAtlas.createTextObject(this.shader, text, 0.5);
                    let obj = asdf.obj;
                    obj.position.x = cx - asdf.width / 2;
                    obj.position.y = cy - 2;
                    obj.position.z = 9;
                    obj.parent = this.unitParent;
                    makeHoverText(cx, cy, 3, 3, `${sporeCount} Spores`);
                    break;
                }
                case "AETower": {
                    makeUnit(cx, cy, cz, 3, unit.Type, white);
                    break;
                }
                case "Inhibitor":
                    makeUnit(cx, cy, cz, 7, unit.Type, white);
                    break;
                case "RunnerNest":
                    makeUnit(cx, cy, cz, 4, "customrunnernest", white);
                    break;
                case "Numen":
                case "Bertha":
                    makeUnit(cx, cy, cz, 5, unit.Type, white);
                    break;
                case "Thor":
                    makeUnit(cx, cy, cz, 9, unit.Type, white);
                    break;
                case "Sniper":
                case "Nullifier":
                case "ShieldGenerator":
                case "Siphon":
                case "Reactor":
                case "Totem":
                case "Collector":
                case "Relay":
                case "TerraPod":
                case "Mortar":
                case "PulseCannon":
                case "ParticleBeam":
                case "OreMine":
                case "SupplyDroneLandingPad":
                case "SupplyDrone":
                case "StrafeDroneLandingPad":
                case "StrafeDrone":
                case "BomberDroneLandingPad":
                case "BomberDrone":
                case "MessageArtifact":
                case "ShieldKey":
                case "Sprayer":
                    makeUnit(cx, cy, cz, 3, unit.Type, white);
                    break;
                case "CommandNode":
                    makeUnit(cx, cy, cz, 9, "commandNode", white);
                    break;
                case "PowerZone":
                    makeUnit(cx, cy, cz, 6, unit.Type, white);
                    break;
                case "ResourcePack": {
                    let color;
                    switch (parseInt(unit.data.querySelector("rprt").innerHTML)) {
                        case 0:
                            color = [0, 1, 0, 1];
                            break;
                        case 1:
                            color = [191 / 255, 127 / 255, 63 / 255, 1];
                            break;
                        case 2:
                            color = white;
                            break;
                    }
                    makeUnit(cx, cy, cz, 3, unit.Type, color);
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
                        let anchor = parseInt(unit.data.querySelector("tem_a").innerHTML);
                        let asdf = this.fontAtlas.createTextObject(this.shader, constText.innerHTML, size, false, color);
                        let obj = asdf.obj;
                        obj.position.x = cx + x;
                        obj.position.y = cy - y;
                        obj.position.z = 9;
                        obj.parent = this.unitParent;
                        switch (anchor) {
                            case 1:
                            case 4:
                            case 7:
                                obj.position.x -= asdf.width / 2;
                                break;
                            case 2:
                            case 5:
                            case 8:
                                obj.position.x -= asdf.width;
                                break;
                        }
                        switch (anchor) {
                            case 3:
                            case 4:
                            case 5:
                                obj.position.y -= asdf.height / 2;
                                break;
                            case 6:
                            case 7:
                            case 8:
                                obj.position.y -= asdf.height;
                                break;
                        }
                    }
                    let si = unit.data.querySelector("si");
                    if (si) {
                        for (const item of si.textContent.split(",")) {
                            let [slot, text] = item.split(";");
                            text = text.toLowerCase();
                            if (text == "none") {
                                continue;
                            }
                            let loc = parseTup(unit.data.querySelector(`OD ${slot}-l`).textContent);
                            let scale = parseTup(unit.data.querySelector(`OD ${slot}-s`).textContent);
                            let rot = parseTup(unit.data.querySelector(`OD ${slot}-r`).textContent)[2];
                            let color = parseTup(unit.data.querySelector(`OD ${slot}-c`).textContent);
                            let img = this.customTextures.get(text);
                            if (!img) {
                                console.error("Missing texture", text);
                                continue;
                            }
                            let w = 3 * scale[0];
                            let h = 3 * scale[1];
                            let obj = new RenderObject(new Mesh(this.shader, centerRect, rect, [
                                ...color,
                                ...color,
                                ...color,
                                ...color,
                                ...color,
                                ...color,
                            ]));
                            obj.position.x = cx + loc[0] / 8;
                            obj.position.y = cy + loc[1] / 8;
                            obj.position.z = cz - loc[2];
                            obj.scale.x = w;
                            obj.scale.y = h;
                            obj.rotation.z = rot * Math.PI / 180;
                            if (!img.tex) {
                                img.tex = loadTexture(this.gl, img.el);
                            }
                            obj.texture = img.tex;
                            obj.parent = this.unitParent;
                        }
                    }
                    break;
                }
                case "ProspectorArtifact": {
                    let type = parseInt(unit.data.querySelector("pat").textContent);
                    let name;
                    switch (type) {
                        case 1:
                            name = "Freeze";
                            break;
                        case 2:
                            name = "Mass";
                            break;
                        case 3:
                            name = "Convert";
                            break;
                    }
                    makeUnit(cx, cy, cz, 6, name, white);
                    break;
                }
                case "TechArtifact": {
                    makeUnit(cx, cy, cz, 3, unit.Type, white);
                    break;
                }
                default:
                    console.log("Unknown type", unit.Type);
                    break;
            }
        }
    }
    updateMesh() {
        let mesh = genMapMesh(this.game);
        let el = this.mapParent.children[0];
        if (el.mesh) {
            el.mesh.update(mesh.vertices, mesh.uvs, mesh.colors);
        }
        else {
            el.mesh = new Mesh(this.shader, mesh.vertices, mesh.uvs, mesh.colors);
        }
    }
    flipVertical() {
        let ter = this.game.Terrain;
        let width = this.game.Info.Width;
        let height = this.game.Info.Height;
        for (let i = 0; i < width / 2; i++) {
            for (let y = 0; y < height; y++) {
                let a = i + y * width;
                let b = (width - i - 1) + y * width;
                [ter.terrain[a], ter.terrain[b]] = [ter.terrain[b], ter.terrain[a]];
                [ter.walls[a], ter.walls[b]] = [ter.walls[b], ter.walls[a]];
            }
        }
        this.updateMesh();
        for (const item of this.game.Units) {
            item.cX = width * 8 - item.cX;
        }
        this.unitParent.children.length = 0;
        this.createUnits();
    }
    flipHorizontal() {
        let ter = this.game.Terrain;
        let width = this.game.Info.Width;
        let height = this.game.Info.Height;
        for (let x = 0; x < width; x++) {
            for (let i = 0; i < height / 2; i++) {
                let a = x + i * width;
                let b = x + (height - i - 1) * width;
                [ter.terrain[a], ter.terrain[b]] = [ter.terrain[b], ter.terrain[a]];
                [ter.walls[a], ter.walls[b]] = [ter.walls[b], ter.walls[a]];
            }
        }
        this.updateMesh();
        for (const item of this.game.Units) {
            item.cY = width * 8 - item.cY;
        }
        this.unitParent.children.length = 0;
        this.createUnits();
    }
    rotateR() {
        let terrain = this.game.Terrain;
        let ter = new Array(terrain.terrain.length);
        let wal = new Array(terrain.walls.length);
        let width = this.game.Info.Width;
        let height = this.game.Info.Height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                ter[(width - y - 1) + x * height] = terrain.terrain[x + y * width];
                wal[(width - y - 1) + x * height] = terrain.walls[x + y * width];
            }
        }
        terrain.terrain = ter;
        this.game.Info.Width = height;
        this.game.Info.Height = width;
        this.updateMesh();
        for (const item of this.game.Units) {
            [item.cX, item.cY] = [item.cY, width * 8 - item.cX];
        }
        this.unitParent.children.length = 0;
        this.createUnits();
    }
    rotateL() {
        let terrain = this.game.Terrain;
        let rotated = new Array(terrain.terrain.length);
        let wal = new Array(terrain.walls.length);
        let width = this.game.Info.Width;
        let height = this.game.Info.Height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                rotated[y + (height - x - 1) * height] = terrain.terrain[x + y * width];
                wal[y + (height - x - 1) * height] = terrain.walls[x + y * width];
            }
        }
        terrain.terrain = rotated;
        this.game.Info.Width = height;
        this.game.Info.Height = width;
        this.updateMesh();
        for (const item of this.game.Units) {
            [item.cX, item.cY] = [width * 8 - item.cY, item.cX];
        }
        this.unitParent.children.length = 0;
        this.createUnits();
    }
    invTer() {
        let terrain = this.game.Terrain;
        let width = this.game.Info.Width;
        let height = this.game.Info.Height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let val = terrain.terrain[x + y * width];
                if (val != 500) {
                    terrain.terrain[x + y * width] = 9 - val;
                }
            }
        }
        this.updateMesh();
    }
    invTex() {
        this.game.Terrain.terrainTextures.reverse();
        this.game.Terrain.terrainBrightness.reverse();
        this.updateMesh();
    }
    _resize() {
        const game = this.game;
        const terrain = game.Terrain;
        let w1 = this.game.Info.Width;
        let h1 = this.game.Info.Height;
        let w2 = parseInt(this.elements[7].children[1].value);
        let h2 = parseInt(this.elements[7].children[4].value);
        let w3 = Math.min(w1, w2);
        let h3 = Math.min(h1, h2);
        let ter = new Array(w2 * h2).fill(500);
        let wal = new Array(w2 * h2).fill(0);
        for (let y = 0; y < w3; y++) {
            for (let x = 0; x < h3; x++) {
                ter[x + y * w2] = terrain.terrain[x + y * w1];
                wal[x + y * w2] = terrain.walls[x + y * w1];
            }
        }
        this.game.Info.Width = w2;
        this.game.Info.Height = h2;
        terrain.terrain = ter;
        terrain.walls = wal;
        terrain.terraformLevels = new Array(w2 * h2).fill(0);
        terrain.partialTerraform = new Array(w2 * h2).fill(0);
        this.updateMesh();
    }
    scale() {
        const game = this.game;
        const terrain = game.Terrain;
        let w1 = this.game.Info.Width;
        let h1 = this.game.Info.Height;
        let w2 = parseInt(this.elements[7].children[1].value);
        let h2 = parseInt(this.elements[7].children[4].value);
        let ter = new Array(w2 * h2).fill(0);
        let wal = new Array(w2 * h2).fill(0);
        function bilinear(arr, x, y) {
            let tl = arr[Math.floor(x) + Math.floor(y) * w1];
            let tr = arr[Math.ceil(x) + Math.floor(y) * w1];
            let bl = arr[Math.floor(x) + Math.ceil(y) * w1];
            let br = arr[Math.ceil(x) + Math.ceil(y) * w1];
            let xFrac = x % 1;
            let yFrac = y % 1;
            return (tl * (1 - xFrac) + tr * xFrac) * (1 - yFrac) + (bl * (1 - xFrac) + br * xFrac) * yFrac;
        }
        for (let y = 0; y < w2; y++) {
            for (let x = 0; x < h2; x++) {
                let x1 = (x / (w2 - 1)) * (w1 - 1);
                let y1 = (y / (h2 - 1)) * (h1 - 1);
                let h = Math.round(bilinear(terrain.terrain, x1, y1));
                if (h > 9) {
                    h = 500;
                }
                if (h < 0) {
                    h = 0;
                }
                ter[x + y * w2] = Math.round(h);
                wal[x + y * w2] = Math.round(bilinear(terrain.walls, x1, y1));
            }
        }
        this.game.Info.Width = w2;
        this.game.Info.Height = h2;
        terrain.terrain = ter;
        terrain.walls = wal;
        terrain.terraformLevels = new Array(w2 * h2).fill(0);
        terrain.partialTerraform = new Array(w2 * h2).fill(0);
        this.updateMesh();
        const sw = w2 / w1;
        const sh = h2 / h1;
        for (const item of this.game.Units) {
            item.cX *= sw;
            item.cY *= sh;
        }
        this.unitParent.children.length = 0;
        this.createUnits();
    }
}
;
