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
uniform float u_angle;
uniform float u_offsets[30];
uniform vec2 u_points[30];
uniform vec2 u_v1;
uniform vec2 u_v2;

const int TOTAL = 30;

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

const testVS = `
#ifdef GL_ES
precision highp float;
#endif

attribute vec2 a_position;
uniform vec2 u_resolution;

void main() {
    vec2 pos = a_position / u_resolution;
    pos *= 2.0;
    pos -= 1.0;
    gl_Position = vec4(pos,0,1);
    gl_PointSize = 4.0;
}
`;

const testFS = `
#ifdef GL_ES
precision highp float;
#endif

void main() {
    gl_FragColor = vec4(1);
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
        this.angle = 20;
        this.size = 0;
        this.divs = 30;
        this.offsets = new Float32Array([]);
        this.points = new Float32Array([]);
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
        this.gl.uniform1f(this.program.u_angle, this.angle * Math.PI / 180);
        this.gl.uniform1fv(this.program.u_offsets, this.offsets);
        this.gl.uniform2fv(this.program.u_points, this.points);
        this.gl.uniform2fv(this.program.u_v1, this.v1);
        this.gl.uniform2fv(this.program.u_v2, this.v2);
        glUtils.reset(this.gl, width, height, true);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, QUAD.length / 2);
        this.updateOffsets();
        /*
        this.gl.useProgram(this.testProgram);
        this.buffer.data(this.points, this.testProgram.a_position, 2);
        this.gl.uniform2fv(this.testProgram.u_resolution, new Float32Array([width, height]));
        this.gl.drawArrays(this.gl.POINTS, 0, this.points.length / 2);        
        */
    };

    initWebGL = () => {
        this.gl = glUtils.getWebGLContext(this.canvas);
        this.program = glUtils.program(this.gl, vs, fs);
        this.buffer = glUtils.buffer(this.gl);

        // this.testProgram = glUtils.program(this.gl, testVS, testFS);
    };

    generateImage = () => {
        const text = 'DEMO';
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
        var points = [];
        const leftX = center.x - this.size / 2;
        const rightX = center.x + this.size / 2;
        const topY = center.y - this.size / 2;
        points.push(
            leftX, topY,    // Top Left Corner
            rightX, topY    // Top Right Corner
        );
        const inc = this.size / this.divs;
        for (let i = 1; i <= this.divs; ++i) {
            const increment = inc * i;
            const y = topY + increment;
            points.push(
                leftX, y,   // Left Point
                rightX, y   // Right Point
            );
        }
        var rotatedPoints = [];
        for (let i = 0; i < points.length; i += 2) {
            const rotated = this.rotatePoint(points[i], points[i + 1]);
            rotatedPoints = rotatedPoints.concat(rotated);
        }

        this.v1 = new Float32Array([
            rotatedPoints[2] - rotatedPoints[0],
            rotatedPoints[3] - rotatedPoints[1]
        ]);
        this.v2 = new Float32Array([
            rotatedPoints[4] - rotatedPoints[0],
            rotatedPoints[5] - rotatedPoints[1]
        ]);
        var filteredPoints = [];
        for (let i = 0; i < rotatedPoints.length; i += 4) {
            if (filteredPoints.length < this.divs * 2) {
                filteredPoints.push(rotatedPoints[i], rotatedPoints[i + 1]);
            }
        }
        this.points = new Float32Array(filteredPoints);
    };

    rotatePoint = (x, y) => {
        const { center } = this.state.viewport;
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
            offsets.push(Math.random() * 100);
        }
        this.offsets = new Float32Array(offsets);
    };

    updateOffsets = () => {
        var offsets = [];
        for (let i = 0; i < this.divs; ++i) {
            offsets.push(this.offsets[i] * 0.96);
        }
        this.offsets = new Float32Array(offsets);
        //console.log(this.offsets);
    }

    updateViewport = (callback = null) => {
        const { innerWidth, innerHeight } = window;
        this.setState({
            viewport: {
                width: innerWidth,
                height: innerHeight,
                center: {
                    x: innerWidth / 2,
                    y: innerHeight / 2
                }
            }
        }, callback);
    };

    render() {
        const viewport = this.state.viewport;
        return (
            <canvas ref={o => { this.canvas = o }}
                width={viewport.width}
                height={viewport.height}
                style={{ zIndex: 2 }}
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