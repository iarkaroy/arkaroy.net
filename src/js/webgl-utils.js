
WebGLBuffer.prototype.data = function (data, location, num) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(location, num, this.gl.FLOAT, this.gl.FALSE, 0, 0);
    this.gl.enableVertexAttribArray(location);
};

WebGLTexture.prototype.bind = function (unit, location) {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this);
    this.gl.uniform1i(location, unit);
};

WebGLFramebuffer.prototype.bind = function () {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this);
    if (this.texture0)
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture0, 0);
};

WebGLFramebuffer.prototype.unbind = function () {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
};

export function getWebGLContext(canvas) {
    var param = {
        alpha: true,
        antialias: true
    };
    var gl = canvas.getContext("webgl", param) || canvas.getContext("experimental-webgl", param);
    if (!gl) {
        throw new Error("WebGL not supported");
    }
    return gl;
}

/**
 * Create WebGL Program with vertex and fragment shaders
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLShader|string} vshader Vertex shader or shader source
 * @param {WebGLShader|string} fshader Fragment shader or shader source
 * @returns {WebGLProgram}
 */
export function program(gl, vshader, fshader) {
    if (!(vshader instanceof WebGLShader)) {
        vshader = createShader(gl, gl.VERTEX_SHADER, vshader);
    }
    if (!(fshader instanceof WebGLShader)) {
        fshader = createShader(gl, gl.FRAGMENT_SHADER, fshader);
    }
    var program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('Error linking program.', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        gl.deleteShader(vshader);
        gl.deleteShader(fshader);
        return null;
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.log('Error linking program.', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        gl.deleteShader(vshader);
        gl.deleteShader(fshader);
        return null;
    }

    attachAttribs(gl, program);
    attachUniforms(gl, program);

    return program;
}

/**
 * Attach attributes to program
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLProgram} program The program to attach attributes to
 * @returns {void}
 */
export function attachAttribs(gl, program) {
    var attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var i = 0; i < attribCount; ++i) {
        var info = gl.getActiveAttrib(program, i);
        program[info.name] = gl.getAttribLocation(program, info.name);
    }
}

/**
 * Attach uniform to program
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLProgram} program The program to attach uniforms to
 * @returns {void}
 */
export function attachUniforms(gl, program) {
    var uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < uniformCount; ++i) {
        const info = gl.getActiveUniform(program, i);
        const name = info.name.replace(/(\[\d+\])/ig, '');
        program[name] = gl.getUniformLocation(program, name);
    }
}

/**
 * Create WebGLShader from source
 * @param {WebGLRenderingContext} gl 
 * @param {number} type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} source source shader script
 * @returns {WebGLShader}
 */
export function createShader(gl, type, source) {
    if (/\.(vs|fs|glsl)$/ig.test(source)) {
        source = require(`../glsl/${source}`);
    }
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('Error compiling vertex shader.', gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

/**
 * Create texture with data
 * @param {WebGLRenderingContext} gl 
 * @param {number} width Width of texture
 * @param {number} height Height of texture
 * @param {Uint8Array} data Data to be written to texture
 * @param {number} wrap Texture wrapping
 * @param {number} filter Texture filter
 * @returns {WebGLTexture}
 */
export function texture(gl, width, height, data, wrap, filter) {
    wrap = wrap || gl.CLAMP_TO_EDGE;
    filter = filter || gl.NEAREST;
    var texture = gl.createTexture();
    texture.gl = gl;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (isArrayBufferView(data) || data === null)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    else
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

/**
 * Create framebuffer
 * @param {WebGLRenderingContext} gl 
 * @returns {WebGLFramebuffer}
 */
export function framebuffer(gl, width, height, wrap = gl.CLAMP_TO_EDGE, filter = gl.NEAREST) {
    var framebuffer = gl.createFramebuffer();
    framebuffer.gl = gl;
    framebuffer.texture0 = texture(gl, width, height, null, wrap, filter);
    return framebuffer;
}

/**
 * Create buffer
 * @param {WebGLRenderingContext} gl 
 * @returns {WebGLBuffer}
 */
export function buffer(gl) {
    var buffer = gl.createBuffer();
    buffer.gl = gl;
    return buffer;
}

export function reset(gl, width, height, blend = false, blendSource = gl.SRC_ALPHA, blendDest = gl.ONE_MINUS_SRC_ALPHA) {
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(blend) {
        gl.enable(gl.BLEND);
        gl.blendFunc(blendSource, blendDest);
    } else {
        gl.disable(gl.BLEND);
    }
}

export function log(msg) {
    if (window.console && window.console.log) {
        window.console.log(msg);
    }
}

export function error(msg) {
    if (window.console && window.console.error) {
        window.console.error(msg);
    } else {
        log(msg);
    }
}

function isArrayBufferView(value) {
    return value && value.buffer instanceof ArrayBuffer && value.byteLength !== undefined;
}