import * as THREE from 'three';

export function loadTexture(imageData: Uint8Array | string) {
    let img = new Image();
    if (imageData instanceof Uint8Array) {
        img.src = URL.createObjectURL(new Blob([imageData.buffer], { type: "image/png" }));
    } else {
        img.src = imageData;
        img.onload = () => tex.needsUpdate = true;
    }

    let tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}
