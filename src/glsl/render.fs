#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
uniform sampler2D u_displacement;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

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

    float angle = PI / 4.;
    vec2 duv = uv + rot(angle) * dispVec * 0.3 * 0.0;
    /*
    vec2 coord = uv / div;
    vec2 delta = vec2(coord.x - u_mouse.x, coord.y - u_mouse.y);
    float distance = length(delta);
    float noise = 1.0;
    uv += noise / distance;
    vec2 duv = texture2D(u_displacement, uv).rg * 2. - 1.;
    uv += duv * 0.05;
    */
    gl_FragColor = texture2D( u_texture, duv );
}