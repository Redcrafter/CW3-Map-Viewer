precision mediump float;
precision mediump sampler2DArray;

in vec3 out_uv;
in vec4 out_color;

out vec4 color;

uniform sampler2DArray diffuse;

void main() {
    vec4 col =  texture(diffuse, out_uv) * out_color * 1.5;
    if(col.a < 0.05) {
        discard;
    }
    color = col;
}
