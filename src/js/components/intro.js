import React, { Component } from 'react';
import FontFaceObserver from 'fontfaceobserver';
import * as glUtils from '../webgl-utils';

const vs = `
#ifdef GL_ES
precision highp float;
#endif

attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;

const fs = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
uniform vec2 u_resolution;

void main() {
    vec2 div = 1.0 / u_resolution;
    vec2 uv = gl_FragCoord.xy * div;
    gl_FragColor = texture2D( u_texture, uv );
}
`;

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

class Intro extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewport: {
                width: 0,
                height: 0
            }
        };
        this.gl = null;
        this.program = null;
        this.buffer = null;
        this.texture = null;
        this.frameId = 0;
    }

    componentDidMount() {
        this.updateViewport(() => {
            const font = new FontFaceObserver('Barlow', {
                weight: 900
            });
            font.load().then(this.generateImage, this.generateImage);
        });
        this.initWebGL();
    }

    loop = () => {
        this.frameId = requestAnimationFrame(this.loop);

        const { width, height } = this.state.viewport;

        this.gl.useProgram(this.program);
        this.texture.bind(0, this.program.u_texture);
        this.buffer.data(QUAD, this.program.a_position, 2);
        this.gl.uniform2fv(this.program.u_resolution, new Float32Array([width, height]));
        glUtils.reset(this.gl, width, height, true);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, QUAD.length / 2);
    };

    initWebGL = () => {
        this.gl = glUtils.getWebGLContext(this.canvas);
        this.program = glUtils.program(this.gl, vs, fs);
        this.buffer = glUtils.buffer(this.gl);
    };

    generateImage = () => {
        const text = 'DEMO TEXT';
        const font = '900 100px Barlow, sans-serif';
        const { width, height } = this.state.viewport;
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.font = font;
        const size = ctx.measureText(text).width + 20;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f0f0f0';
        ctx.font = font;
        ctx.fillText(text, width / 2, height / 2);
        //window.open(ctx.canvas.toDataURL());
        this.texture = glUtils.texture(this.gl, width, height, ctx.canvas);
        if (!this.frameId)
            this.frameId = requestAnimationFrame(this.loop);
    };

    updateViewport = (callback = null) => {
        this.setState({
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        }, callback);
    };

    render() {
        const viewport = this.state.viewport;
        return (
            <canvas ref={o => { this.canvas = o }}
                width={viewport.width}
                height={viewport.height}
                style={{ zIndex: 2 }} />
        );
    }

}

export default Intro;