import { Game, compress } from "./cw3.js";
import { produceHighlighted } from "../highlighter.js";
import { addTab, leftTabs } from "../mapEditor.js";
import { generateMesh } from "./terrain.js";
import { GetKeyDown, KeyCode, UpdateKeys } from "../input.js";

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

let defaultTextures = new Map<string, string | THREE.Texture>([
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
    ["SupplyDroneLandingPad", "guppy_pad.png"], // TODO: other pads
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

let textures = new Map<string, THREE.Texture>();

function loadTexture(src: string) {
    let img = new Image();
    img.src = src;

    let tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    img.onload = () => tex.needsUpdate = true;

    return tex;
}

function download(data: BlobPart, filename: string) {
    let file = new Blob([data]);
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

function addScript(item: Game["Scripts"][0]) {
    leftTabs.script.tab.appendChild(createElements(
        <div onclick={() => {
            let tab = addTab({ name: item.name });
            tab.classList.add("crplCode");

            let highlight = document.createElement("div");
            produceHighlighted(item.code, highlight);

            tab.appendChild(highlight);
        }}>{item.name}</div>
    ));
}

export class cw3MapViewer {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;

    private renderer: THREE.WebGLRenderer;
    private textRenderer2: CSS2DRenderer;
    private textRenderer3: CSS3DRenderer;
    private scene: THREE.Scene;

    private camera: THREE.OrthographicCamera;
    // private fontAtlas: FontAtlas;
    private bg: THREE.Sprite;
    private mapParent: THREE.Group;
    private unitParent: THREE.Group;
    private map: THREE.Mesh;

    private stats: Stats;

    private game: Game;
    private textElements: CSS2DObject[] = [];

    private elements: HTMLElement[];

    private mouseDown: boolean;

    constructor(canvas: HTMLCanvasElement, container: HTMLElement) {
        this.container = container;
        this.canvas = canvas;

        // let hoverInfo = document.createElement("span");
        // hoverInfo.innerText = "Height: N/A";
        // hoverInfo.id = "hoverInfo";

        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(0, 500, 500, 0);
        this.camera.position.z = 200;
        // this.camera.lookAt(0);
        this.camera.updateProjectionMatrix();

        this.renderer = new THREE.WebGLRenderer({ canvas });

        this.stats = new Stats();
        this.stats.dom.style.top = "initial";
        this.stats.dom.style.left = "initial";
        this.stats.dom.style.display = "none";

        this.container.appendChild(this.stats.dom);

        let c1 = createElements(<div style="position: absolute"></div>);
        let c2 = createElements(<div style="position: absolute"></div>);

        this.textRenderer2 = new CSS2DRenderer({ element: c1 });
        this.textRenderer3 = new CSS3DRenderer({ element: c2 });

        this.container.append(c1, c2);
    }

    start() {
        this.stats.begin();
        let f = () => {
            this.update();
            requestAnimationFrame(f);
        }
        requestAnimationFrame(f);
    }

    update() {
        if (this.container.clientWidth != this.canvas.width || this.container.clientHeight != this.canvas.height) {
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.textRenderer2.setSize(this.container.clientWidth, this.container.clientHeight);
            this.textRenderer3.setSize(this.container.clientWidth, this.container.clientHeight);

            this.camera.right = this.container.clientWidth;
            this.camera.top = this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            // ref.controls.handleResize();

            if (this.bg) {
                this.bg.scale.x = this.container.clientWidth;
                this.bg.scale.y = this.container.clientHeight;

                this.bg.position.x = this.container.clientWidth / 2;
                this.bg.position.y = this.container.clientHeight / 2;
            }
        }

        if (GetKeyDown(KeyCode.D)) {
            if (this.stats.dom.style.display == "none") {
                this.stats.dom.style.display = "";
            } else {
                this.stats.dom.style.display = "none";
            }
        }

        this.stats.update();
        this.renderer.render(this.scene, this.camera);
        this.textRenderer2.render(this.scene, this.camera);
        this.textRenderer3.render(this.scene, this.camera);

        UpdateKeys();
    }

    loadMap(game: Game) {
        this.start();

        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.container.addEventListener("mousedown", this.onMouseDown.bind(this));

        this.container.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("mousemove", this.onMouseMove1.bind(this));
        this.container.addEventListener("wheel", this.onWheel.bind(this));

        this.elements = createElements([
            <button onclick={() => this.flipVertical()} >Flip vertically</button>,
            <button onclick={() => this.flipHorizontal()}>Flip horizontally</button>,
            <button onclick={() => this.rotateR()}>Rotate right</button>,
            <button onclick={() => this.rotateL()}>Rotate left</button>,
            <button onclick={() => this.invTer()}>Invert terrain</button>,
            <button onclick={() => this.invTex()}>Invert textures</button>,
            <div><input type="checkbox" oninput={(e) => this.unitParent.visible = !e.target.checked} /><label>Hide units</label></div>,
            <div>
                <label>Width: </label><input type="number" id="inputW" min="1" max="512" /><br />
                <label>Height:</label><input type="number" id="inputH" min="1" max="512" /><br />
                <button onclick={() => this._resize()} title="Resize the map without changing terrain">Resize</button>
                <button onclick={() => this.scale()} title="Stretch the map to the specified size">Scale</button>
            </div>,
            <button onclick={() => this.save()}>Save</button>
        ]) as HTMLElement[];
        leftTabs.general.tab.append(...this.elements);

        this.bg = new THREE.Sprite(new THREE.SpriteMaterial({
            map: loadTexture("./cw3/img/purple-nebula_front5.png")
        }));
        this.bg.position.z = -2;
        this.bg.scale.x = 100;
        this.bg.scale.y = 100;
        this.scene.add(this.bg);

        this.mapParent = new THREE.Group();
        this.mapParent.scale.x = 10;
        this.mapParent.scale.y = 10;
        this.scene.add(this.mapParent);

        this.unitParent = new THREE.Group();
        this.mapParent.add(this.unitParent);

        {
            let tex = loadTexture("./cw3/img/testAtlas.png");

            let mat = new THREE.MeshBasicMaterial({
                map: tex,
                vertexColors: true
            });
            this.map = new THREE.Mesh(generateMesh(game), mat);
            this.map.position.z = -1;
            this.map.scale.y = -1;
            this.map.position.y = game.Info.Height;
            this.mapParent.add(this.map);
        }

        //#region Load game data
        this.game = game;
        // for (const item of actions) { document.getElementById(item.elementName).disabled = false; }
        (this.elements[7].children[1] as HTMLInputElement).value = game.Info.Width.toString();
        (this.elements[7].children[4] as HTMLInputElement).value = game.Info.Height.toString();
        //#endregion

        // Load images
        // while (images.firstChild) { images.removeChild(images.firstChild); }
        for (const item of game.CustomImages) {
            let src = "data:image/png;base64, " + item.base64;
            let img = loadTexture(src);
            textures.set(item.name, img);

            leftTabs.image.images.appendChild(createElements(<div class={`customImage x${item.size}`}>
                <p>{item.name}</p>
                <img src={src}></img>
            </div>));
        }

        this.createUnits();

        // this.updateMesh();

        addTab({
            name: "Map Editor",
            closeAble: false,
            mainEl: this.container
        });

        for (const item of game.Scripts) {
            addScript(item);
        }
    }

    getTexture(name: string) {
        let def = defaultTextures.get(name);

        if (def) {
            if (typeof def === "string") {
                def = loadTexture(`cw3/img/${def}`);
                defaultTextures.set(name, def);
            }
            return def;
        }

        let asd = textures.get(name);
        if (!asd) {
            console.error("Missing texture", name);
            return THREE.Texture.DEFAULT_IMAGE;
        }
        return asd;
    }

    onMouseMove(e: MouseEvent) {
        if (!this.game) return;
        let bb = this.container.getBoundingClientRect();

        let mouseX = e.pageX - bb.left;
        let mouseY = bb.height - (e.pageY - bb.top);

        mouseX = (mouseX - this.mapParent.position.x) / this.mapParent.scale.x;
        mouseY = (mouseY - this.mapParent.position.y) / this.mapParent.scale.y;

        let x = Math.floor(mouseX);
        let y = Math.floor(mouseY);

        if (x < 0 || x >= this.game.Info.Width || y < 0 || y >= this.game.Info.Height) {
            // hoverInfo.innerText = "Height: N/A";
        } else {
            let h = this.game.Terrain.terrain[x + y * this.game.Info.Width];
            // hoverInfo.innerText = `Height: ${h == 500 ? "void" : h}`;
        }

        for (const obj of this.textElements) {
            const w = obj.userData.w;
            const h = obj.userData.h;

            obj.visible =
                mouseX > (obj.position.x - w / 2) &&
                mouseX < (obj.position.x + w / 2) &&
                mouseY > (obj.position.y - h / 2) &&
                mouseY < (obj.position.y + h / 2);
        }
    }

    onMouseDown() {
        this.mouseDown = true;
    }
    onMouseUp() {
        this.mouseDown = false;
    }
    onMouseMove1(e: MouseEvent) {
        if (this.mouseDown) {
            this.mapParent.position.x += e.movementX;
            this.mapParent.position.y -= e.movementY;
        }
    }
    onWheel(e: WheelEvent) {
        let factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        let bb = this.container.getBoundingClientRect();

        if (this.mapParent.scale.x < 3 && factor < 1 || this.mapParent.scale.x > 1000 && factor > 1)
            return;

        this.mapParent.scale.x *= factor;
        this.mapParent.scale.y *= factor;

        let x = e.pageX - bb.left;
        let y = bb.height - (e.pageY - bb.top);

        this.mapParent.position.x = factor * (this.mapParent.position.x - x) + x;
        this.mapParent.position.y = factor * (this.mapParent.position.y - y) + y;
    }

    async save() {
        let dat = await compress(this.game);
        download(new Uint8Array(dat), "save.cw3");
    }

    makeUnit(x: number, y: number, z: number, size: number, name: string, color?: [number, number, number]) {
        let obj = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.getTexture(name) }));

        if (color) {
            obj.material.color.setRGB(color[0], color[1], color[2], THREE.SRGBColorSpace);
            obj.material.needsUpdate = true;
        }

        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;

        obj.scale.x = size;
        obj.scale.y = size;

        this.unitParent.add(obj);
        return obj;
    }

    makeHoverText(x: number, y: number, w: number, h: number, text: string) {
        // trim all lines
        text = text.split("\n").map(x => x.trim()).join("\n");

        let el = createElements(<div class="cw3HoverText" style="translate: 0 -50%">{text}</div>)

        let obj = new CSS2DObject(el);

        // let ret = this.fontAtlas.createTextObject(this.material, text, 1, true);

        obj.position.x = x; // - ret.width / 2;
        obj.position.y = y; // - ret.height;
        obj.position.z = 9;
        obj.visible = false;

        obj.userData.w = w;
        obj.userData.h = h;

        this.unitParent.add(obj);

        this.textElements.push(obj);
    }

    createUnits() {
        let game = this.game;

        for (const unit of game.Units) {
            let cx = unit.cX / 8;
            let cy = unit.cY / 8;
            let cz = -unit.cZ / 8;

            switch (unit.Type) {
                case "Emitter": {
                    let st = unit.getNum("sT"); // sleep time??
                    let ft = unit.getNum("fT"); // idk
                    let interval = unit.getNum("pI");
                    let amount = unit.getNum("pBA") / 1000000;

                    this.makeUnit(cx, cy, cz, 3, unit.Type);
                    this.makeHoverText(cx, cy, 3, 3, `Amt: ${amount}\nInterval: ${interval / 30}`);
                    break;
                }
                case "OreDeposit":
                    this.makeUnit(cx, cy, cz, 4, "OreDepositBg");
                    this.makeUnit(cx, cy, cz, 4, "OreDeposit");
                    break;
                case "SporeTower": {
                    let initialDelay = unit.getNum("stid");
                    let waveDelay = unit.getNum("stwi");
                    let sporeCount = unit.getNum("stwc");
                    let sporePayload = unit.getNum("stsp");

                    this.makeUnit(cx, cy, cz, 3, "customsporetower");

                    let text;
                    if (initialDelay > game.Info.UpdateCount) {
                        // still building
                        text = `Build: ${Math.floor((game.Info.UpdateCount / initialDelay) * 100)}%`;
                    } else {
                        // done building
                        let time = ((game.Info.UpdateCount - initialDelay) % waveDelay) / 30;
                        text = `${Math.floor(time / 60)}:${Math.floor(time % 60)}%`;
                        this.makeUnit(cx, cy, cz, 3, "sporeTop", [0.5, 0.5, 1]);
                    }

                    let el = document.createElement("div");
                    el.classList.add("cw3HoverText");
                    el.textContent = text;
                    el.style.fontSize = "1.5px";

                    let obj = new CSS3DObject(el);

                    obj.position.x = cx;
                    obj.position.y = cy - 2;
                    obj.position.z = 9;
                    obj.scale.x = 0.5;
                    obj.scale.y = 0.5;
                    this.unitParent.add(obj);

                    this.makeHoverText(cx, cy, 3, 3, `${sporeCount} Spores`);
                    break;
                }
                case "AETower": {
                    this.makeUnit(cx, cy, cz, 3, unit.Type); break;
                    // TODO: add hover zone
                }
                case "Inhibitor": this.makeUnit(cx, cy, cz, 7, unit.Type); break;
                case "RunnerNest": this.makeUnit(cx, cy, cz, 4, "customrunnernest"); break;
                case "Numen":
                case "Bertha": this.makeUnit(cx, cy, cz, 5, unit.Type); break;
                case "Thor": this.makeUnit(cx, cy, cz, 9, unit.Type); break;
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
                case "Sprayer": this.makeUnit(cx, cy, cz, 3, unit.Type); break;
                case "CommandNode": this.makeUnit(cx, cy, cz, 9, "commandNode"); break;
                case "PowerZone": this.makeUnit(cx, cy, cz, 6, unit.Type); break;
                case "ResourcePack": {
                    let color: [number, number, number];
                    switch (unit.getNum("rprt")) {
                        case 0: color = [0, 1, 0]; break; // Energy green
                        case 1: color = [191 / 255, 127 / 255, 63 / 255]; break; // Ore    brown
                        case 2: color = [1, 1, 1]; break; // Aether white
                    }
                    this.makeUnit(cx, cy, cz, 3, unit.Type, color);
                    break;
                }
                case "CRPLTower": {
                    let hoverText = unit.getVal("put_t");
                    if (hoverText) {
                        this.makeHoverText(cx, cy, unit.ugsw, unit.ugsh, hoverText);
                    }

                    let constText = unit.getVal("tem_t");
                    if (constText && constText.trim() != "") {
                        let size = unit.getNum("tem_s") / 100;
                        let color = unit.getTup("tem_c");
                        let x = unit.getNum("tem_x") / 8;
                        let y = unit.getNum("tem_y") / 8;
                        let anchor = unit.getNum("tem_a");

                        // TODO: text alignment

                        let el = document.createElement("div");
                        el.classList.add("cw3HoverText");
                        el.textContent = constText;
                        // el.style.fontSize = size.toString();
                        el.style.color = `rgb(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255})`;
                        el.style.fontSize = "2px";

                        let obj = new CSS3DObject(el);

                        obj.position.x = cx + x;
                        obj.position.y = cy + y;
                        obj.position.z = 9;

                        obj.scale.x = size;
                        obj.scale.y = size;
                        this.unitParent.add(obj);

                        let tx = "0%";
                        let ty = "0%";

                        // debugger
                        switch (anchor) { // horizontal
                            case 0: case 3: case 6: // Left
                                tx = "50%";
                                break;
                            case 1: case 4: case 7: // Center
                                break; // default
                            case 2: case 5: case 8: // Right
                                tx = "-50%";
                                break;
                        }

                        switch (anchor) { // vertical
                            case 0: case 1: case 2: // Top
                                ty = "50%";
                                break;
                            case 3: case 4: case 5: // Middle
                                break; // default
                            case 6: case 7: case 8: // Bottom
                                ty = "-50%";
                                break;
                        }

                        let str = `translate(${tx}, ${ty})`;
                        obj.onAfterRender = (r, s, c) => {
                            // depends on internals of css render. translates based on anchor
                            if (!el.style.transform.endsWith(str)) {
                                el.style.transform += str;
                            }
                        };
                    }

                    let si = unit.getVal("si")
                    if (si) {
                        for (const item of si.split(",")) {
                            let [slot, text] = item.split(";");
                            text = text.toLowerCase();
                            if (text == "none") {
                                continue;
                            }

                            let loc = unit.getTup(`OD ${slot}-l`);
                            let scale = unit.getTup(`OD ${slot}-s`);
                            let rot = unit.getTup(`OD ${slot}-r`);
                            let color = unit.getTup(`OD ${slot}-c`);

                            let w = 3 * scale[0];
                            let h = 3 * scale[1];

                            let col = new THREE.Color();
                            col.setRGB(color[0], color[1], color[2], THREE.SRGBColorSpace);

                            let obj = new THREE.Sprite(new THREE.SpriteMaterial({
                                color: col,
                                opacity: color[3],
                                map: this.getTexture(text)
                            }));

                            obj.position.x = cx + loc[0] / 8;
                            obj.position.y = cy + loc[1] / 8;
                            obj.position.z = cz - loc[2];

                            obj.scale.x = w;
                            obj.scale.y = h;

                            obj.material.rotation = rot[2] * Math.PI / 180;
                            this.unitParent.add(obj);
                        }
                    }

                    break;
                }
                case "ProspectorArtifact": {
                    let type = unit.getNum("pat");

                    let name;
                    switch (type) {
                        case 1: name = "Freeze"; break;
                        case 2: name = "Mass"; break;
                        case 3: name = "Convert"; break;
                    }
                    this.makeUnit(cx, cy, cz, 6, name);
                    break;
                }
                case "TechArtifact": {
                    // TODO: icons
                    this.makeUnit(cx, cy, cz, 3, unit.Type);
                    break;
                }
                default:
                    console.log("Unknown type", unit.Type);
                    break;
            }
        }
    }

    updateMesh() {
        this.map.geometry = generateMesh(this.game);
    }

    clearUnits() {
        this.unitParent.children.length = 0;
        this.textElements.length = 0;

        this.textRenderer2.domElement.replaceChildren();
        this.textRenderer3.domElement.firstElementChild.firstElementChild.replaceChildren();
    }

    // TODO: add transform function?
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

        this.clearUnits();
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

        this.clearUnits();
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

        this.clearUnits();
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

        this.clearUnits();
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

        let w2 = parseInt((this.elements[7].children[1] as HTMLInputElement).value);
        let h2 = parseInt((this.elements[7].children[4] as HTMLInputElement).value);

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

        let w2 = parseInt((this.elements[7].children[1] as HTMLInputElement).value);
        let h2 = parseInt((this.elements[7].children[4] as HTMLInputElement).value);

        let ter = new Array(w2 * h2).fill(0);
        let wal = new Array(w2 * h2).fill(0);

        /*function px(arr: number[], x: number, y: number) {
            x = Math.min(Math.max(x, 0), w1 - 1);
            y = Math.min(Math.max(y, 0), h1 - 1);

            let v = arr[x + y * w1];
            if(v == 500) {
                v = -1;
            }
            return v;
        }

        function cubic_hermite(A: number, B: number, C: number, D: number, t: number) {
            let a = (D - A + 3 * (B - C)) / 2;
            // let b = A + 2 * C - (5 * B + D) / 2;
            let b = (A + C) / 2 - B - a;
            let c = (C - A) / 2;

            return B + t * (c + t * (b + t * a));
        }

        function bicubic(arr: number[], x: number, y: number) {
            let asd = [];

            let xint = Math.floor(x);
            let yint = Math.floor(y);

            let xFrac = x % 1;
            let yFrac = y % 1;

            for (let i = -1; i < 3; i++) {
                let a = px(arr, xint - 1, yint + i);
                let b = px(arr, xint + 0, yint + i);
                let c = px(arr, xint + 1, yint + i);
                let d = px(arr, xint + 2, yint + i);
                asd.push(cubic_hermite(a, b, c, d, xFrac));
            }

            return cubic_hermite(asd[0], asd[1], asd[2], asd[3], yFrac);
        }*/

        function bilinear(arr: number[], x: number, y: number) {
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

        this.clearUnits();
        this.createUnits();
    }
};
