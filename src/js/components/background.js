import React, { Component } from 'react';
import * as glUtils from '../webgl-utils';

const quadVS = `
#ifdef GL_ES
precision highp float;
#endif

attribute vec2 a_quad;

void main() {
    gl_Position = vec4(a_quad, 0, 1);
}
`;

const renderFS = `
#ifdef GL_ES
precision highp float;
#endif

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
    
    vec2 dispUV = uv + u_frame * 0.0004;
    vec4 disp = texture2D(u_displacement, fract(dispUV));
    vec2 dispVec = vec2(disp.r, disp.g) * 0.2;
    vec2 coord = uv / div;
    vec2 delta = vec2( coord.x - u_mouse.x, coord.y - u_mouse.y );
    float distance = length(delta);
    dispVec -= 0.0015 * distance;
    vec2 distortedUV = uv + clamp( dispVec, 0.0, 0.2 );
    vec2 xx = clamp( dispVec, 0.0, 0.2 );
    float avg = (xx.x + xx.y) / 2.;
    gl_FragColor = vec4(avg * 5.);
}
`;

const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.src = src;
    });
};

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

class Background extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewportWidth: 0,
            viewportHeight: 0
        };
        this.updateViewportDimension = this.updateViewportDimension.bind(this);
        this.loop = this.loop.bind(this);
        this.mouse = new Float32Array([0, 0]);
        this.program = null;
        this.buffer = null;
        this.dispTexture = null;
        this.frameId = null;
        this.frame = 0;
    }

    componentDidMount() {
        this.canvas = this.refs.canvas;
        this.gl = glUtils.getWebGLContext(this.canvas);
        this.gl.getExtension('OES_texture_float');
        this.gl.getExtension('GL_OES_standard_derivatives');
        this.gl.getExtension('OES_standard_derivatives');
        this.gl.getExtension('EXT_shader_texture_lod');
        this.updateViewportDimension();
        window.addEventListener('resize', this.updateViewportDimension);
        document.addEventListener('mousemove', this.updateMousePosition);
        loadImage('clouds.jpg').then(image => {
            this.program = glUtils.program(this.gl, quadVS, renderFS);
            this.buffer = glUtils.buffer(this.gl);
            this.dispTexture = glUtils.texture(this.gl, image.width, image.height, image);
            this.frame = 0;
            if (!this.frameId) {
                this.frameId = requestAnimationFrame(this.loop);
            }
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateViewportDimension);
        document.removeEventListener('mousemove', this.updateMousePosition);
        cancelAnimationFrame(this.frameId);
    }

    loop() {
        this.frameId = requestAnimationFrame(this.loop);
        this.gl.useProgram(this.program);
        this.dispTexture.bind(0, this.program.u_displacement);
        this.buffer.data(QUAD, this.program.a_quad, 2);
        this.gl.uniform2fv(this.program.u_mouse, this.mouse);
        this.gl.uniform2fv(this.program.u_resolution, new Float32Array([this.canvas.width, this.canvas.height]));
        this.gl.uniform1f(this.program.u_frame, this.frame++);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, QUAD.length / 2);
    }

    updateViewportDimension() {
        this.setState({
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        });
    }

    updateMousePosition = (event) => {
        this.mouse = new Float32Array([event.pageX, event.pageY]);
    }

    render() {
        return (
            <canvas
                ref="canvas"
                width={this.state.viewportWidth}
                height={this.state.viewportHeight}
                style={{ zIndex: 1 }}
            />
        );
    }

}

export default Background;