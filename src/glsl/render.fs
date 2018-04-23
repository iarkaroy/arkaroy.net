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

/*
uniform sampler2D texturePosition;
uniform vec2 mouseUv;
uniform vec2 resolution;
uniform float bound;
uniform float radius;
uniform float speed;
uniform float decay;
uniform float fading;
uniform float noiseFading;
uniform float noiseFadingFactor1;
uniform float noiseFadingFactor2;
uniform float strength;
varying vec2 vUv;
const float PI = 3.14159265359;
void main() {
    vec2 div = 1.0 / resolution.xy;
    // vec2 uv = gl_FragCoord.xy * div;
    vec2 uv = vUv;
    //
    vec4 texValue = texture2D( texturePosition, uv );
    vec4 up    = texture2D( texturePosition, uv + vec2( 0.0,  div.y ) );
    vec4 down  = texture2D( texturePosition, uv + vec2( 0.0, -div.y ) );
    vec4 right = texture2D( texturePosition, uv + vec2( div.x, 0.0 ) );
    vec4 left  = texture2D( texturePosition, uv + vec2( -div.x, 0.0 ) );
    // viscosity
    float average = up.x + down.x + right.x + left.x - 4.0 * texValue.x;
    float gravity = resolution.x / speed;
    float velocity = average * gravity;
    texValue.y += velocity;
    texValue.x += texValue.y / decay;
    texValue.x += average * 0.03;
    // mouse
    float updown = clamp( length( (uv - mouseUv) * bound ) * PI / radius, 0.0, PI );
    texValue.x += (cos( updown ) + 1.0) * strength; 
    // noise
    float s=sin(average);
    float c=cos(average);
    mat3 m3=mat3(s,c*c,c*s,0,s,-c,-c,s*c,s*s);
    vec3 vel = vec3(1.0,1.0,0.0)*m3;
    vec3 wave = normalize(vec3(vUv, 0.0) - 0.5)*m3;
    vec3 col=(cos(vel)+cos(12.0 * wave)) * noiseFading;
    // float noise = (0.5 + col.x*0.5);
    float noise = (noiseFadingFactor1 + col.x*noiseFadingFactor2);
    texValue.x *= mix(noise, 1.0, clamp(dot(uv,vUv), 0.0, 1.0) );
    // fade
    texValue *= fading;
    gl_FragColor = texValue;
}
*/