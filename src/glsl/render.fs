#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
uniform sampler2D u_displacement;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_frame;

const float PI = 3.14159265359;

mat2 rot(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 div   = 1.0 / u_resolution.xy;
    vec2 uv    = gl_FragCoord.xy * div;
    uv.y = 1.0 - uv.y;
    
    vec4 disp = texture2D(u_displacement, uv);
    vec2 dispVec = vec2(disp.r, disp.g);
    vec2 distortedUV = uv + dispVec * 0.2;

    // float angle = PI / 3.;
    // vec2 duv = uv + rot(angle) * dispVec * 0.3 * 0.1;
    gl_FragColor = texture2D( u_texture, distortedUV );
}