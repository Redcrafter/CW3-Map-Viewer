
import { Game } from "./cw3.js";
import * as THREE from 'three';

export function generateMesh(map: Game) {
    let terrain = map.Terrain.terrain;
    let width = map.Info.Width;
    let height = map.Info.Height;

    let vertices = [];
    let uvs = [];
    let colors = [];

    // number of sub tiles for texture wrap
    const subTiles = 32;
    const tileSize = 256 / subTiles;

    const atlasWidth = 2064;
    const atlasHeight = 4128;
    function getUV(x: number, y: number, texture: number) {
        texture = Math.min(texture, 127); // TODO: custom map textures
        let x1 = (texture % 8) * 258 + 1 + (x % subTiles) * tileSize;
        let y1 = Math.floor(texture / 8) * 258 + 1 + (y % subTiles) * tileSize;

        let x2 = x1 + tileSize;
        let y2 = y1 + tileSize;

        x1 /= atlasWidth;
        y1 /= atlasHeight;
        x2 /= atlasWidth;
        y2 /= atlasHeight;

        // https://gamedev.stackexchange.com/questions/46963/how-to-avoid-texture-bleeding-in-a-texture-atlas
        // shit don't work because of linear scaling
        // worked around with 1px border for each texture

        return {
            tl: [x1, 1 - y1],
            tr: [x2, 1 - y1],
            bl: [x1, 1 - y2],
            br: [x2, 1 - y2],
            x: x1,
            y: y1,
            w: tileSize / atlasWidth,
            h: tileSize / atlasHeight
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
            // let brightness = map.Terrain.terrainBrightness[h] / 50;
            let brightness = 1;

            const l = x == 0 ? h : terrain[x - 1 + y * width];
            const r = x + 1 == width ? h : terrain[x + 1 + y * width];
            const t = y == 0 ? h : terrain[x + (y - 1) * width];
            const b = y + 1 == height ? h : terrain[x + (y + 1) * width];

            // xxx
            // x x
            // xxx
            if (l > h && l == r && l == t && l == b) {
                let lUv = getUV(x, y, map.Terrain.terrainTextures[l]);

                if (l != 500) {
                    let b = map.Terrain.terrainBrightness[l] / 50;

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
                        lUv.x + lUv.w / 2, 1 - lUv.y,
                        lUv.x, 1 - (lUv.y + lUv.h / 2),

                        lUv.x + lUv.w / 2, 1 - lUv.y,
                        ...lUv.tr,
                        lUv.x + lUv.w, 1 - (lUv.y + lUv.h / 2),

                        lUv.x + lUv.w, 1 - (lUv.y + lUv.h / 2),
                        ...lUv.br,
                        lUv.x + lUv.w / 2, 1 - (lUv.y + lUv.h),

                        lUv.x + lUv.w / 2, 1 - (lUv.y + lUv.h),
                        ...lUv.bl,
                        lUv.x, 1 - (lUv.y + lUv.h / 2),
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
                    mainUv.x, 1 - (mainUv.y + mainUv.h / 2),
                    mainUv.x + mainUv.w / 2, 1 - mainUv.y,
                    mainUv.x + mainUv.w / 2, 1 - (mainUv.y + mainUv.h),

                    mainUv.x + mainUv.w / 2, 1 - mainUv.y,
                    mainUv.x + mainUv.w, 1 - (mainUv.y + mainUv.h / 2),
                    mainUv.x + mainUv.w / 2, 1 - (mainUv.y + mainUv.h),
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

                if (l != 500) {
                    let b = map.Terrain.terrainBrightness[l] / 50;
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
                        lUv.x + lUv.w / 2, 1 - lUv.y,
                        ...lUv.bl,

                        lUv.x + lUv.w / 2, 1 - lUv.y,
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
                    mainUv.x + mainUv.w / 2, 1 - mainUv.y,
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
                        lUv.x, 1 - (lUv.y + lUv.h / 2),

                        lUv.x, 1 - (lUv.y + lUv.h / 2),
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
                    mainUv.x, 1 - (mainUv.y + mainUv.h / 2),
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
                        lUv.x + lUv.w / 2, 1 - (lUv.y + lUv.h),
                        ...lUv.bl,

                        lUv.x + lUv.w / 2, 1 - (lUv.y + lUv.h),
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
                    mainUv.x + mainUv.w / 2, 1 - (mainUv.y + mainUv.h),
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
                        rUv.x + rUv.w, 1 - (rUv.y + rUv.h / 2),

                        rUv.x + rUv.w, 1 - (rUv.y + rUv.h / 2),
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
                    mainUv.x + mainUv.w, 1 - (mainUv.y + mainUv.h / 2),
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

    var geom = new THREE.BufferGeometry();
    geom.name = "MapMesh";
    geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 2));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));

    return geom;
}
