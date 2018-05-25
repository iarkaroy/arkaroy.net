import React, { Component } from 'react';
import FontFaceObserver from 'fontfaceobserver';
import * as glUtils from '../webgl-utils';

const vsQuad = `
#ifdef GL_ES
precision highp float;
#endif

attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;

const fsSimulation = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_angle;
uniform float u_offsets[40];
uniform vec2 u_points[40];
uniform vec2 u_v1;
uniform vec2 u_v2;

const int TOTAL = 40;

void main() {
    vec2 div = 1.0 / u_resolution;
    vec2 uv = gl_FragCoord.xy * div;
    vec4 color = vec4(0);
    for(int i = 0; i < TOTAL; ++i) {
        float offset = u_offsets[i];
        vec2 point = u_points[i];
        vec2 disp = vec2(
            cos(u_angle) * offset,
            sin(u_angle) * offset
        );
        vec2 offsetPoint = point + disp;
        vec2 relPoint = gl_FragCoord.xy - offsetPoint;
        // 0<=dot_product(v,v1)<=dot_product(v1,v1) and 0<=dot_product(v,v2)<=dot_product(v2,v2)
        if( dot( relPoint, u_v1 ) >= 0.0 && dot( relPoint, u_v1 ) <= dot( u_v1, u_v1 ) && dot( relPoint, u_v2 ) >= 0.0 && dot( relPoint, u_v2 ) <= dot( u_v2, u_v2 ) ) {
            vec2 realUV = gl_FragCoord.xy - disp;
            uv = realUV * div;
            color = texture2D( u_texture, uv );
        }
    }
    gl_FragColor = color;
}
`;

const fsRender = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
uniform vec2 u_resolution;

void main() {
    vec2 div = 1.0 / u_resolution.xy;
    vec2 uv = gl_FragCoord.xy * div;
    uv.y = 1.0 - uv.y;
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
                height: 0,
                center: {
                    x: 0,
                    y: 0
                }
            }
        };
        this.angle = -45;
        this.size = 0;
        this.divs = 40;
        this.initPoints = [];
        this.initV1 = [];
        this.initV2 = [];
        this.offsets = new Float32Array([]);
        this.points = new Float32Array([]);
        this.v1 = new Float32Array([]);
        this.v2 = new Float32Array([]);
        this.gl = null;
        this.simulationProgram = null;
        this.renderProgram = null;
        this.buffer = null;
        this.texture = null;
        this.fbo = null;
        this.frameId = 0;
    }

    componentDidMount() {
        this.updateViewport(() => {
            const font = new FontFaceObserver('Barlow', {
                weight: 900
            });
            font.load().then(this.generateImage, this.generateImage);
            this.initWebGL();
        });
        window.addEventListener('resize', this.onResize, false);
    }

    componentWillUnmount() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = 0;
        }
        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => {
        this.updateViewport(() => {
            this.generateImage();
            this.initWebGL();
        });
    };

    loop = () => {
        var t0 = performance.now();

        this.frameId = requestAnimationFrame(this.loop);

        const { width, height } = this.state.viewport;

        var program = this.simulationProgram;
        this.gl.useProgram(program);
        this.texture.bind(0, program.u_texture);
        this.buffer.data(QUAD, program.a_position, 2);
        this.gl.uniform2fv(program.u_resolution, new Float32Array([width, height]));
        this.gl.uniform1f(program.u_angle, this.angle * Math.PI / 180);
        this.gl.uniform1fv(program.u_offsets, this.offsets);
        this.gl.uniform2fv(program.u_points, this.points);
        this.gl.uniform2fv(program.u_v1, this.v1);
        this.gl.uniform2fv(program.u_v2, this.v2);
        this.fbo.bind();
        glUtils.reset(this.gl, width, height, true);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, QUAD.length / 2);
        // this.angle += 0.5;
        // this.calculateRotatedPoints();

        program = this.renderProgram;
        this.gl.useProgram(program);
        this.fbo.texture0.bind(0, program.u_texture);
        this.buffer.data(QUAD, program.a_position, 2);
        this.gl.uniform2fv(program.u_resolution, new Float32Array([width, height]));
        this.fbo.unbind();
        glUtils.reset(this.gl, width, height, true);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, QUAD.length / 2);

        var t1 = performance.now();
        // console.log(performance.memory.usedJSHeapSize / 1048576);
    };

    initWebGL = () => {
        const { width, height } = this.state.viewport;
        this.gl = glUtils.getWebGLContext(this.canvas);
        this.simulationProgram = glUtils.program(this.gl, vsQuad, fsSimulation);
        this.renderProgram = glUtils.program(this.gl, vsQuad, fsRender);
        this.buffer = glUtils.buffer(this.gl);
        this.fbo = glUtils.framebuffer(this.gl, width, height);
    };

    generateImage = () => {
        const text = 'DEMO TEXT';
        const font = '900 280px Barlow, sans-serif';
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
        this.texture = glUtils.texture(this.gl, width, height, ctx.canvas);
        const rad = 45 * Math.PI / 180;
        this.size = size * Math.cos(rad) + size * Math.sin(rad);
        this.generateBoundingBox();
        this.generateOffsets();
        if (!this.frameId)
            this.frameId = requestAnimationFrame(this.loop);
    };

    generateBoundingBox = () => {
        const { width, height, center } = this.state.viewport;

        const leftX = center.x - this.size / 2;
        const topY = center.y - this.size / 2;
        const inc = this.size / this.divs;

        this.initPoints = [];
        this.initPoints.push(
            leftX, topY,    // Top Left Corner
        );

        for (let i = 1; i < this.divs; ++i) {
            const increment = inc * i;
            const y = topY + increment;
            this.initPoints.push(
                leftX, y,   // Left Point
            );
        }
        
        this.initV1 = [
            this.size,
            0
        ];
        this.initV2 = [
            0,
            inc - 1
        ];
        this.calculateRotatedPoints();
    };

    calculateRotatedPoints = () => {
        var rotatedPoints = [];
        for (let i = 0; i < this.initPoints.length; i += 2) {
            const rotated = this.rotatePoint(this.initPoints[i], this.initPoints[i + 1]);
            rotatedPoints = rotatedPoints.concat(rotated);
        }
        this.v1 = new Float32Array(this.rotatePoint(this.initV1[0], this.initV1[1], { x: 0, y: 0 }));
        this.v2 = new Float32Array(this.rotatePoint(this.initV2[0], this.initV2[1], { x: 0, y: 0 }));
        this.points = new Float32Array(rotatedPoints);
    };

    rotatePoint = (x, y, center = this.state.viewport.center) => {
        var rad = (Math.PI / 180) * this.angle,
            cos = Math.cos(rad),
            sin = Math.sin(rad),
            nx = (cos * (x - center.x)) - (sin * (y - center.y)) + center.x,
            ny = (cos * (y - center.y)) + (sin * (x - center.x)) + center.y;
        return [nx, ny];
    };

    generateOffsets = () => {
        var offsets = [];
        for (let i = 1; i <= this.divs; ++i) {
            const o = Math.random() * 10 + 10;
            // offsets.push(Math.random() < 0.5 ? o : -o);
            offsets.push(0);
        }
        this.offsets = new Float32Array(offsets);
    };

    updateViewport = (callback = null) => {
        const { innerWidth, innerHeight } = window;
        this.setState({
            viewport: {
                width: innerWidth * 2,
                height: innerHeight * 2,
                center: {
                    x: innerWidth,
                    y: innerHeight
                }
            }
        }, callback);
    };

    render() {
        const { width, height, center } = this.state.viewport;
        return (
            <canvas ref={o => { this.canvas = o }}
                width={width}
                height={height}
                style={{ zIndex: 2, width: center.x, height: center.y }}
            />
        );
    }

}

export default Intro;

/*
* P is the point.
* C is a corner of the rectangle.
* v1 and v2 are the two vectors that define the sides (with C as origin).
* v = P-C

P is in the rectangle if and only if
0<=dot_product(v,v1)<=dot_product(v1,v1) and 0<=dot_product(v,v2)<=dot_product(v2,v2)
*/