import React, { Component } from 'react';
import { glMatrix, mat4 } from 'gl-matrix';
import * as glUtils from '../webgl-utils';

const vs = `
#ifdef GL_ES
precision highp float;
#endif

attribute vec3 a_position;
uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    vec4 pos = vec4(a_position, 1);
    gl_Position = u_projection * u_view * u_world * pos;
    gl_PointSize = 2.0;
}
`;

const fs = `
#ifdef GL_ES
precision highp float;
#endif

const float PI = 3.14159265359;

void main() {
    gl_FragColor = vec4(vec3(0.4), 1);
}
`;

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

const coordAtSphere = (theta, phi) => {
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.cos(theta);
    const z = Math.sin(theta) * Math.sin(phi);
    return [x, y, z];
};

const generateSphereCoords = (num = 100, line = true) => {
    var vertices = [];
    for (let i = 0; i < num; ++i) {
        const theta = Math.random() * Math.PI;
        const phi = Math.random() * 2 * Math.PI;
        var coord = coordAtSphere(theta, phi);
        vertices = vertices.concat(coord);
        if (line) {
            var t = Math.random() * 0.6 + 0.8;
            vertices = vertices.concat(coord.map(c => c * t));
        }
    }
    return new Float32Array(vertices);
};

const lineVertices = generateSphereCoords(200);
const dotVertices = generateSphereCoords(100, false);

class Background extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewportWidth: 0,
            viewportHeight: 0
        };
        this.updateViewportDimension = this.updateViewportDimension.bind(this);
        this.loop = this.loop.bind(this);
        this.setupViewport = this.setupViewport.bind(this);
        this.mouse = new Float32Array([0, 0]);
        this.program = null;
        this.buffer = null;
        this.frameId = null;
        this.matWorld = new Float32Array(16);
        this.matView = new Float32Array(16);
        this.matProjection = new Float32Array(16);
        this.matIdentity = new Float32Array(16);
        this.angleX = 0;
        this.angleY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
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
        this.program = glUtils.program(this.gl, vs, fs);
        this.buffer = glUtils.buffer(this.gl);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateViewportDimension);
        document.removeEventListener('mousemove', this.updateMousePosition);
        cancelAnimationFrame(this.frameId);
    }

    loop() {
        this.frameId = requestAnimationFrame(this.loop);

        this.gl.useProgram(this.program);
        this.buffer.data(lineVertices, this.program.a_position, 3);
        this.angleX += this.velocityX;
        this.angleY += this.velocityY;
        mat4.rotateX(this.matWorld, this.matIdentity, this.angleX);
        mat4.rotateY(this.matWorld, this.matWorld, this.angleY);
        this.gl.uniformMatrix4fv(this.program.u_world, false, this.matWorld);
        this.gl.uniformMatrix4fv(this.program.u_view, false, this.matView);
        this.gl.uniformMatrix4fv(this.program.u_projection, false, this.matProjection);
        glUtils.reset(this.gl, this.state.viewportWidth * 2, this.state.viewportHeight * 2, true);
        this.gl.drawArrays(this.gl.LINES, 0, lineVertices.length / 6);
        this.buffer.data(dotVertices, this.program.a_position, 3);
        this.gl.drawArrays(this.gl.POINTS, 0, dotVertices.length / 3);
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
    }

    updateViewportDimension() {
        this.setState({
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        }, () => this.setupViewport());
    }

    setupViewport() {
        mat4.identity(this.matWorld);
        mat4.lookAt(this.matView, [0, 0, 4], [0, 0, 0], [0, 1, 0]);
        mat4.perspective(this.matProjection, glMatrix.toRadian(45), this.canvas.width / this.canvas.height, 0.1, 100.0);
        mat4.identity(this.matIdentity);
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.loop);
        }
    }

    updateMousePosition = (event) => {
        const pageX = event.pageX;
        const pageY = event.pageY;
        const halfWidth = this.state.viewportWidth / 2;
        const halfHeight = this.state.viewportHeight / 2;
        this.velocityY = -((pageX / halfWidth) - 1) * 0.01;
        this.velocityX = -((pageY / halfHeight) - 1) * 0.01;
    }

    render() {
        return (
            <canvas
                ref="canvas"
                width={this.state.viewportWidth * 2}
                height={this.state.viewportHeight * 2}
                style={{ zIndex: 1, width: this.state.viewportWidth, height: this.state.viewportHeight }}
            />
        );
    }

}

export default Background;