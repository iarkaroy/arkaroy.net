import React, { Component } from 'react';
import * as glUtils from '../webgl-utils';

const quadVS = `
#ifdef GL_ES
precision highp float;
#endif

attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;

const blurFS = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_direction;

const float PI = 3.14159265359;

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

void main() {
    vec2 div   = 1.0 / u_resolution.xy;
    vec2 uv    = gl_FragCoord.xy * div;
    uv.y = 1.0 - uv.y;
    vec2 coord = uv / div;
    vec2 delta = vec2(u_mouse.x - coord.x, u_mouse.y - coord.y);
    float distance = length(delta);
    vec4 color = texture2D(u_image, uv);
    if(distance < 60.) {
        color = vec4(0);
    }
    gl_FragColor = color;
}
`;

const renderFS = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float m[20];

void main() {
    vec2 div   = 1.0 / u_resolution.xy;
    vec2 uv    = gl_FragCoord.xy * div;
    vec4 c = texture2D(u_image, uv);
    gl_FragColor.r = m[0] * c.r + m[1] * c.g + m[2] * c.b + m[3] * c.a + m[4];
	gl_FragColor.g = m[5] * c.r + m[6] * c.g + m[7] * c.b + m[8] * c.a + m[9];
	gl_FragColor.b = m[10] * c.r + m[11] * c.g + m[12] * c.b + m[13] * c.a + m[14];
    gl_FragColor.a = m[15] * c.r + m[16] * c.g + m[17] * c.b + m[18] * c.a + m[19];
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
        this.createImage = this.createImage.bind(this);
        this.loop = this.loop.bind(this);
        this.mouse = new Float32Array([0, 0]);
        this.program = null;
        this.buffer = null;
        this.texture = null;
        this.frameId = null;
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
        this.createImage();
        this.program = glUtils.program(this.gl, quadVS, blurFS);
        this.buffer = glUtils.buffer(this.gl);
        this.colorMatrix = new Float32Array([
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0,
        ]);
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.loop);
        }
    }

    createImage() {
        var ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        ctx.fillStyle = '#fff';
        ctx.font = '550px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('TEST', window.innerWidth / 2, window.innerHeight / 2);
        this.texture = glUtils.texture(this.gl, ctx.canvas.width, ctx.canvas.height, ctx.canvas, this.gl.CLAMP_TO_EDGE, this.gl.LINEAR);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateViewportDimension);
        document.removeEventListener('mousemove', this.updateMousePosition);
        cancelAnimationFrame(this.frameId);
    }

    loop() {
        this.frameId = requestAnimationFrame(this.loop);
        
        this.gl.useProgram(this.program);
        this.texture.bind(0, this.program.u_image);
        this.buffer.data(QUAD, this.program.a_position, 2);
        this.gl.uniform2fv(this.program.u_resolution, new Float32Array([this.canvas.width, this.canvas.height]));
        this.gl.uniform2fv(this.program.u_mouse, this.mouse);
        // this.gl.uniform1fv(this.program.m, this.colorMatrix);
        glUtils.reset(this.gl, this.state.viewportWidth, this.state.viewportHeight, true);
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
                style={{ zIndex: 1, filter: 'blur(5px) contrast(25)' }}
            />
        );
    }

}

export default Background;