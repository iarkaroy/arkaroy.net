#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
uniform sampler2D u_displacement;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 coord = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
    vec2 uv = coord.xy / u_resolution.xy;
    vec2 delta = vec2(coord.x - u_mouse.x, coord.y - u_mouse.y);
    float distance = length(delta);
    vec2 deltaNormal = delta / distance;
    //uv += deltaNormal * sin(distance * .025) * .025;
    //float d = texture2D(u_displacement, uv).b * 2.0 - 1.0;
    //uv += deltaNormal * d * 0.01;
    if(distance < 100.0) {
        uv += deltaNormal * sin(distance * .1) * .02;
        float d = texture2D(u_displacement, uv).b * 2.0 - 1.0;
        //uv += d * 0.005;
    }
    gl_FragColor = texture2D(u_texture, uv);
}