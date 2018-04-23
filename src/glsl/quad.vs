#ifdef GL_ES
precision highp float;
#endif

attribute vec2 a_quad;

void main() {
    gl_Position = vec4(a_quad, 0, 1);
}