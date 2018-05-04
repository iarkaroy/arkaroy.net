require('../scss/main.scss');

import Slices from './slices';
import animate from './animate';
import FontFaceObserver from 'fontfaceobserver';
import * as util from './webgl-utils';

var document = window.document;
var canvas = document.getElementById('canvas');
//var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const angle = -45;
var slices;

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

var gl = util.getWebGLContext(canvas);
gl.getExtension('OES_texture_float');
gl.getExtension('GL_OES_standard_derivatives');
gl.getExtension('OES_standard_derivatives');
gl.getExtension('EXT_shader_texture_lod');

var fakeCtx = document.createElement('canvas').getContext('2d');
fakeCtx.canvas.width = canvas.width;
fakeCtx.canvas.height = canvas.height;

var mouse = new Float32Array([0, 0]);

var texImg, texDisp, program, buffer, frame = 0;

Promise.all([
    loadImage('art.jpg'),
    loadImage('clouds.jpg')
]).then((images, widths, heights) => {
    // console.log(images);
    fakeCtx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
    var imagedata = fakeCtx.getImageData(0, 0, fakeCtx.canvas.width, fakeCtx.canvas.height);
    program = util.program(gl, 'quad.vs', 'render.fs');
    buffer = util.buffer(gl);
    texImg = util.texture(gl, canvas.width, canvas.height, new Uint8Array(imagedata.data));
    texDisp = util.texture(gl, images[1].width, images[1].height, images[1]);
    requestAnimationFrame(render);
});

function render() {
    requestAnimationFrame(render);
    gl.useProgram(program);
    texImg.bind(0, program.u_texture);
    texDisp.bind(1, program.u_displacement);
    buffer.data(QUAD, program.a_quad, 2);
    gl.uniform2fv(program.u_mouse, mouse);
    gl.uniform2fv(program.u_resolution, new Float32Array([canvas.width, canvas.height]));
    gl.uniform1f(program.u_frame, frame++);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, QUAD.length / 2);
}

document.addEventListener('mousemove', function (evt) {
    const x = evt.pageX / canvas.width * 2 - 1;
    const y = evt.pageY / canvas.height * -2 + 1;
    mouse = new Float32Array([evt.pageX, evt.pageY]);
}, false);

function loadImage(src) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.src = src;
    });
}