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

vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.3846153846) * direction;
    vec2 off2 = vec2(3.2307692308) * direction;
    color += texture2D(image, uv) * 0.2270270270;
    color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
    color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
    color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
    color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
    return color;
}

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.411764705882353) * direction;
    vec2 off2 = vec2(3.2941176470588234) * direction;
    vec2 off3 = vec2(5.176470588235294) * direction;
    color += texture2D(image, uv) * 0.1964825501511404;
    color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
    color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
    return color;
}

void main() {
    vec2 div   = 1.0 / u_resolution.xy;
    vec2 uv    = gl_FragCoord.xy * div;
    uv.y = 1.0 - uv.y;
    
    vec2 coord = uv / div;
    vec2 delta = vec2(coord.x - u_mouse.x, coord.y - u_mouse.y);
    float distance = length(delta);
    float s = sin(distance * 0.01);
    float c = cos(distance * 0.01);
    // float offset = (s) / distance * 20.;
    mat3 m3 = mat3(s,c*c,c*s,0,s,-c,-c,s*c,s*s);
    vec3 vel = vec3(1.0,1.0,0.0) * m3;
    vec3 wave = normalize(vec3(uv, 0.0) - 0.5) * m3;
    vec3 col = (cos(vel)+cos(12.0 * wave)) * noiseFading;
    float noise = (noiseFadingFactor1 + col.x * noiseFadingFactor2);
    // uv.x *= mix(noise, 1.0, clamp(dot(uv,uv), 0.0, 1.0) ) * 0.1;
    uv += noise / distance;
    /*
    vec2 coord = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
    vec2 delta = vec2(coord.x - u_mouse.x, coord.y - u_mouse.y);
    float distance = length(delta);
    vec2 deltaNormal = delta / distance;
    if(distance < 100.0) {
        uv += deltaNormal * sin(distance * .1) * .02;
        float d = texture2D(u_displacement, uv).b * 2.0 - 1.0;
    }
    */
    gl_FragColor = texture2D( u_texture, uv );
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