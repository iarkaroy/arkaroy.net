#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
uniform sampler2D u_displacement;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

const float PI = 3.14159265359;
const float speed = 10.0;
const float decay = 200.0;
const float bound = 400.0;
const float radius = 20.0;
const float strength = 2.0;
const float fading = 1.0;
const float noiseFading = 0.65;
const float noiseFadingFactor1 = 0.6;
const float noiseFadingFactor2 = 0.4;

void main() {
    vec2 div   = 1.0 / u_resolution.xy;
    vec2 uv    = gl_FragCoord.xy * div;
    uv.y = 1.0 - uv.y;
    
    vec2 coord = uv / div;
    vec2 delta = vec2(coord.x - u_mouse.x, coord.y - u_mouse.y);
    float distance = length(delta);
    // float s = sin(distance * 0.01);
    // float c = cos(distance * 0.01);
    float noise = 100.0+texture2D(u_displacement, uv).b;
    uv += noise / (distance * distance);
    gl_FragColor = texture2D( u_texture, uv );
}