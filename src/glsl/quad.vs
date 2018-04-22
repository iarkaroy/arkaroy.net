#ifdef GL_ES
precision highp float;
#endif

attribute vec2 a_quad;
uniform sampler2D u_displacement;
uniform vec2 u_mouse;
varying vec2 v_index;

float rand(vec2 co) {
    float t = dot(vec2(12.9898, 78.233), co);
    return fract(sin(t) * (4375.85453 + t));
}

void main() {
    v_index = (a_quad + 1.0) / 2.0;
    vec2 pos = vec2(a_quad.x, a_quad.y * -1.0);
    if(u_mouse.x > -2.0 && u_mouse.y > -2.0) {
        if(distance(pos, u_mouse) < 0.01) {
            pos /= texture2D(u_displacement, v_index).b;
        }
    }
    gl_Position = vec4(pos, 0, 1);
}