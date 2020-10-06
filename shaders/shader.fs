precision mediump float;

varying vec2 Uv;
varying vec4 Color;

uniform sampler2D texture;

void main() {
    vec4 col = texture2D(texture, Uv) * Color;
    if(col.a < 0.1) {
        discard;
    }
    gl_FragColor = col;
}
