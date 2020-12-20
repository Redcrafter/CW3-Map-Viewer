function createPerspective(fov, aspect, far, near) {
    let s = 1 / Math.tan((fov / 2) * (Math.PI / 180));
    let mat = new Float32Array(4 * 4);
    mat[0] = s / aspect;
    mat[5] = s;
    mat[10] = (near + far) / (near - far);
    mat[11] = -1;
    mat[14] = (near * far * 2) / (near - far);
    return mat;
}
function createOrtho(left, right, top, bottom, far = 1, near = -1) {
    let mat = new Float32Array(4 * 4);
    mat[0] = 2 / (right - left);
    mat[3] = -(right + left) / (right - left);
    mat[5] = 2 / (top - bottom);
    mat[7] = -(top + bottom) / (top - bottom);
    mat[10] = -2 / (far - near);
    mat[11] = -(far + near) / (far - near);
    mat[15] = 1;
    return mat;
}
function rotateX(angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    return [
        1, 0, 0, 0,
        0, cos, -sin, 0,
        0, sin, cos, 0,
        0, 0, 0, 1
    ];
}
function rotateY(angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    return [
        cos, 0, sin, 0,
        0, 1, 0, 0,
        -sin, 0, cos, 0,
        0, 0, 0, 1
    ];
}
function rotateZ(angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    return [
        cos, -sin, 0, 0,
        sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}
function translate(x, y, z) {
    return [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
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
function mul(...matrices) {
    function m(left, right) {
        let res = new Float32Array(4 * 4);
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                let v = 0;
                for (let i = 0; i < 4; i++) {
                    v += left[y * 4 + i] * right[i * 4 + x];
                }
                res[x + y * 4] = v;
            }
        }
        return res;
    }
    let res = m(matrices[0], matrices[1]);
    for (let i = 2; i < matrices.length; i++) {
        res = m(res, matrices[i]);
    }
    return res;
}
export { createOrtho, createPerspective, rotateX, rotateY, rotateZ, translate, scale, mul };
