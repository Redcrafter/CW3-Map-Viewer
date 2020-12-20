#version 300 es

precision mediump float;

in vec2 Uv;
in vec4 Color;

out vec4 color;

uniform sampler2D tex;

void main() {
    vec4 col = texture(tex, Uv) * Color;
    if(col.a == 0.0) {
        discard;
    }
    color = col;
}
