function createOrtho(left, right, top, bottom, far = 1, near = -1) {
    return [
        2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, -2 / (far - near), 0,
        -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
    ];
}
function rotateZ(angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    return [
        cos, sin, 0, 0,
        -sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}
function translate(x, y, z) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ];
}
function scale(x, y, z) {
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ];
}
function mul(left, right) {
    let res = [];
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            let v = 0;
            for (let i = 0; i < 4; i++) {
                v += left[i * 4 + y] * right[x * 4 + i];
            }
            res[x * 4 + y] = v;
        }
    }
    return res;
}
export { createOrtho, rotateZ, translate, scale, mul };
