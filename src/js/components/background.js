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
uniform vec2 u_blur;

const float PI = 3.14159265359;

void main() {
    vec2 div   = 1.0 / u_resolution.xy;
    vec2 uv    = gl_FragCoord.xy * div;
    // uv.y = 1.0 - uv.y;
    vec2 px = u_blur / 7.0;
    px /= u_resolution;
    vec2 coord = uv / div;
    vec2 delta = vec2(coord.x - u_mouse.x, coord.y - u_mouse.y);
    float distance = length(delta);
    gl_FragColor = vec4(0.0);
    if(distance > 40.) {
        gl_FragColor += texture2D(u_image, uv + vec2(-7.0*px.x, -7.0*px.y))*0.0044299121055113265;
        gl_FragColor += texture2D(u_image, uv + vec2(-6.0*px.x, -6.0*px.y))*0.00895781211794;
        gl_FragColor += texture2D(u_image, uv + vec2(-5.0*px.x, -5.0*px.y))*0.0215963866053;
        gl_FragColor += texture2D(u_image, uv + vec2(-4.0*px.x, -4.0*px.y))*0.0443683338718;
        gl_FragColor += texture2D(u_image, uv + vec2(-3.0*px.x, -3.0*px.y))*0.0776744219933;
        gl_FragColor += texture2D(u_image, uv + vec2(-2.0*px.x, -2.0*px.y))*0.115876621105;
        gl_FragColor += texture2D(u_image, uv + vec2(-1.0*px.x, -1.0*px.y))*0.147308056121;
        gl_FragColor += texture2D(u_image, uv                             )*0.159576912161;
        gl_FragColor += texture2D(u_image, uv + vec2( 1.0*px.x,  1.0*px.y))*0.147308056121;
        gl_FragColor += texture2D(u_image, uv + vec2( 2.0*px.x,  2.0*px.y))*0.115876621105;
        gl_FragColor += texture2D(u_image, uv + vec2( 3.0*px.x,  3.0*px.y))*0.0776744219933;
        gl_FragColor += texture2D(u_image, uv + vec2( 4.0*px.x,  4.0*px.y))*0.0443683338718;
        gl_FragColor += texture2D(u_image, uv + vec2( 5.0*px.x,  5.0*px.y))*0.0215963866053;
        gl_FragColor += texture2D(u_image, uv + vec2( 6.0*px.x,  6.0*px.y))*0.00895781211794;
        gl_FragColor += texture2D(u_image, uv + vec2( 7.0*px.x,  7.0*px.y))*0.0044299121055113265;
    }
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
        this.blur = this.blur.bind(this);
        this.loop = this.loop.bind(this);
        this.mouse = new Float32Array([0, 0]);
        this.blurProgram = null;
        this.renderProgram = null;
        this.buffer = null;
        this.fbo = null;
        this.texImage = null;
        this.texRender = null;
        this.texMatrix = null;
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
        this.blurProgram = glUtils.program(this.gl, quadVS, blurFS);
        this.renderProgram = glUtils.program(this.gl, quadVS, renderFS);
        this.buffer = glUtils.buffer(this.gl);
        this.fbo = glUtils.framebuffer(this.gl);
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
        ctx.font = 'bold 360px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('TEST', window.innerWidth / 2, window.innerHeight / 2);
        this.texImage = glUtils.texture(this.gl, ctx.canvas.width, ctx.canvas.height, ctx.canvas);
        this.texMatrix = glUtils.texture(this.gl, ctx.canvas.width, ctx.canvas.height, null);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateViewportDimension);
        document.removeEventListener('mousemove', this.updateMousePosition);
        cancelAnimationFrame(this.frameId);
    }

    blur(src, size = 2) {
        var t0 = glUtils.texture(this.gl, this.state.viewportWidth, this.state.viewportHeight, null);
        var t1 = glUtils.texture(this.gl, this.state.viewportWidth, this.state.viewportHeight, null);

        this.gl.useProgram(this.blurProgram);
        src.bind(0, this.blurProgram.u_image);
        this.buffer.data(QUAD, this.blurProgram.a_position, 2);
        this.gl.uniform2fv(this.blurProgram.u_resolution, new Float32Array([this.canvas.width, this.canvas.height]));
        this.gl.uniform2fv(this.blurProgram.u_blur, new Float32Array([0, 0]));
        this.fbo.bind(t0);
        glUtils.reset(this.gl, this.state.viewportWidth, this.state.viewportHeight, true);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, QUAD.length / 2);

        const count = Math.ceil(size / 5);
        for(var i = 0; i < count; ++i) {
            this.gl.useProgram(this.blurProgram);
            t0.bind(0, this.blurProgram.u_image);
            this.buffer.data(QUAD, this.blurProgram.a_position, 2);
            this.gl.uniform2fv(this.blurProgram.u_resolution, new Float32Array([this.canvas.width, this.canvas.height]));
            this.gl.uniform2fv(this.blurProgram.u_blur, new Float32Array([0, 5]));
            this.fbo.bind(t1);
            glUtils.reset(this.gl, this.state.viewportWidth, this.state.viewportHeight, true);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, QUAD.length / 2);

            this.gl.useProgram(this.blurProgram);
            t1.bind(0, this.blurProgram.u_image);
            this.buffer.data(QUAD, this.blurProgram.a_position, 2);
            this.gl.uniform2fv(this.blurProgram.u_resolution, new Float32Array([this.canvas.width, this.canvas.height]));
            this.gl.uniform2fv(this.blurProgram.u_blur, new Float32Array([5, 0]));
            this.fbo.bind(t0);
            glUtils.reset(this.gl, this.state.viewportWidth, this.state.viewportHeight, true);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, QUAD.length / 2);
            
        }

        return t0;
    }

    loop() {
        this.frameId = requestAnimationFrame(this.loop);

        this.texMatrix = this.blur(this.texImage, 10);

        this.gl.useProgram(this.renderProgram);
        this.texMatrix.bind(0, this.renderProgram.u_image);
        this.buffer.data(QUAD, this.renderProgram.a_position, 2);
        this.gl.uniform2fv(this.renderProgram.u_resolution, new Float32Array([this.canvas.width, this.canvas.height]));
        this.gl.uniform1fv(this.renderProgram.m, this.colorMatrix);
        this.fbo.unbind();
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
                style={{ zIndex: 1 }}
            />
        );
    }

}

export default Background;