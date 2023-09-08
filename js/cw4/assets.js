import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { loadTexture } from '../util.js';
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.156.1/examples/jsm/libs/draco/gltf/');
const gltf = new GLTFLoader();
gltf.setDRACOLoader(dracoLoader);
let nativeModels = {
    "AlienArtifactA": "cw4/models/AlienArtifactA.obj",
    "Carbon_Tower4": "cw4/models/Tower4.obj",
    "Plate_Quarter": "cw4/models/Plate_Quater.obj",
    "Dome50A": "cw4/models/Dome50A.obj"
};
let nativeTextures = {
    "AlienArtifactA": "cw4/img/AlienArtifactA_AlbedoTransparency.png",
    "Dome50A": "cw4/img/Dome50A_AlbedoTransparency.png"
};
let nativeUnits = {
    "Emitter": "cw4/models/Emitter.glb",
    "Totem": "cw4/models/Totem.glb",
    "GreenarMother": "cw4/models/Greenar Mother.glb",
    "ResourceBlue": "cw4/models/Blueite Ore.glb",
    "Wall": "cw4/models/Wall.glb",
    "Crystal": loadCrystal
};
async function loadCrystal() {
    let texture = loadTexture("cw4/img/cw4units4X.png");
    let loader = new OBJLoader();
    let bottom = await loader.loadAsync("cw4/models/Crystal.obj");
    let top = await loader.loadAsync("cw4/models/CrystalTop0.obj");
    top.position.y = 2;
    top.children[0].material.map = texture;
    bottom.children[0].material.map = texture;
    let el = new THREE.Group();
    el.add(top, bottom);
    nativeUnits["Crystal"] = el;
    return el;
}
export async function getModel(name) {
    let el = nativeModels[name];
    if (!el)
        return null;
    if (typeof el === "string") {
        nativeModels[name] = el = await new OBJLoader().loadAsync(el);
    }
    return el.clone(true);
}
export async function getTexture(name) {
    let tex = nativeTextures[name];
    if (!tex)
        return null;
    if (typeof tex === "string") {
        nativeTextures[name] = tex = loadTexture(tex);
    }
    return tex;
}
export async function getUnit(name) {
    let el = nativeUnits[name];
    if (!el)
        return null;
    if (typeof el == "function") {
        el = await el();
    }
    else if (typeof el == "string") {
        el = await gltf.loadAsync(el);
    }
    nativeUnits[name] = el;
    if (el instanceof THREE.Object3D) {
        return { obj: el.clone(true) };
    }
    else {
        let obj = SkeletonUtils.clone(el.scene);
        let mixer;
        if (el.animations.length != 0) {
            mixer = new THREE.AnimationMixer(obj);
            var anim = mixer.clipAction(el.animations[0]);
            anim.setLoop(THREE.LoopPingPong, Infinity);
            anim.play();
        }
        return { obj, mixer };
    }
}
