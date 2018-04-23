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

var font = new FontFaceObserver('Montserrat', {
    weight: 700
});
font.load().then(() => {
    fakeCtx.textBaseline = 'top';
    fakeCtx.textAlign = 'left';
    fakeCtx.fillStyle = '#444';
    fakeCtx.font = '700 600px Montserrat';
    fakeCtx.fillText('DEMO', 200, -120);
    setup();
});

var tex, disp, program, buffer;

var displacements = [];
for(var i = 0; i < canvas.width * canvas.height; ++i) {
    displacements.push(
        0,
        0,
        Math.floor(Math.random() * 256),
        0
    );
}

function setup() {
    program = util.program(gl, 'quad.vs', 'render.fs');
    buffer = util.buffer(gl);
    var imagedata = fakeCtx.getImageData(0, 0, fakeCtx.canvas.width, fakeCtx.canvas.height);
    tex = util.texture(gl, canvas.width, canvas.height, new Uint8Array(imagedata.data));
    disp = util.texture(gl, canvas.width, canvas.height, new Uint8Array(displacements));
    requestAnimationFrame(render);
}

function render() {
    requestAnimationFrame(render);
    gl.useProgram(program);
    tex.bind(0, program.u_texture);
    disp.bind(1, program.u_displacement);
    buffer.data(QUAD, program.a_quad, 2);
    gl.uniform2fv(program.u_mouse, mouse);
    gl.uniform2fv(program.u_resolution, new Float32Array([canvas.width, canvas.height]));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
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


/*
var font = new FontFaceObserver('Montserrat', {
    weight: 700
});
font.load().then(() => {
    slices = new Slices({
        text: 'ARKA ROY',
        angle: angle,
        segments: 20,
        fontWeight: '700',
        fontFamily: 'Montserrat',
        fillColor: '#ffffff'
    }).get();
    for (var i = 0; i < slices.length; ++i) {
        var slice = slices[i];
        var ys = [
            -slice.height,
            canvas.height
        ];
        slice.y = ys[Math.floor(Math.random() * ys.length)];
        slice.x = (slice.y - (canvas.height - slice.height) / 2) / Math.tan(angle * Math.PI / 180);
        slice.x += (canvas.width - slice.width) / 2;
        slice.o = 0;
    }
    animate({
        targets: slices,
        x: (canvas.width - slice.width) / 2,
        y: (canvas.height - slice.height) / 2,
        o: 1,
        easing: 'backOut',
        duration: 1500,
        delay: (target, index) => {
            return Math.floor(Math.random() * 1000);
        },
        update: render
    
    });
});

var fakeCtx = document.createElement('canvas').getContext('2d');
fakeCtx.canvas.width = canvas.width;
fakeCtx.canvas.height = canvas.height;

function render() {
    fakeCtx.clearRect(0, 0, canvas.width, canvas.height);
    var len = slices.length;
    for (var i = 0; i < len; ++i) {
        var slice = slices[i];
        fakeCtx.globalAlpha = slice.o;
        fakeCtx.drawImage(slice.canvas, slice.x, slice.y);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(fakeCtx.canvas, 0, 0);
}
*/