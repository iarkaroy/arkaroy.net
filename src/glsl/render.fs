#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
uniform sampler2D u_displacement;
varying vec2 v_index;

void main() {
    gl_FragColor = texture2D(u_texture, v_index);
}