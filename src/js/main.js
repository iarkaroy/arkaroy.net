require('../scss/main.scss');

var document = window.document;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var mouse, data, buffer, pixels;

class Pixel {
    constructor(x, y, data) {
        this.position = new Vector2D(x, y);
        this.origin = new Vector2D().copyFrom(this.position);
        this.velocity = new Vector2D();
        this.data = data;
    }
    render() {
        /*
        var vec = new Vector2D().copyFrom(this.position).sub(mouse);
        var dist = vec.length();
        var radius = 100;
        var angle = vec.direction();
        var amount = clamp(convertRange(dist, 0, radius, 100, 0), -100, 100);
        var target = new Vector2D().copyFrom(this.origin).addAngleRadius(angle, radius);
        vec = vec.copyFrom(target).sub(this.position).mult(0.1);
        this.velocity.add(vec);
        this.position.add(this.velocity);
        this.velocity.mult(0.92);
        */
        var index = Math.floor(this.position.y * canvas.width + this.position.x);
        buffer[index] = this.data;
    }
}

class Vector2D {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    mult(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }
    copyFrom(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    direction() {
        return Math.atan2(this.y, this.x);
    }
    addAngleRadius(angle, radius) {
        this.x += Math.cos(angle) * radius;
        this.y += Math.sin(angle) * radius;
        return this
    }
}

function convertRange(f, i, g, k, h) {
    var j = (g - i);
    var e = (h - k);
    return (((f - i) * e) / j) + k;
}

function clamp(f, g, e) { return Math.min(Math.max(f, g), e) }


mouse = new Vector2D(canvas.width / 2, canvas.height / 2);
data = ctx.getImageData(0, 0, canvas.width, canvas.height);
buffer = new Uint32Array(data.data.buffer);
pixels = [];

getImagePixels('art.jpg').then((pxs, width, height) => {
    pixels = pxs;
    requestAnimationFrame(render);
});

function render() {
    requestAnimationFrame(render);
    buffer.fill(0);
    pixels.forEach(pixel => pixel.render());
    //console.log(buffer);
    ctx.putImageData(data, 0, 0);
}

function getImagePixels(src) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.onload = () => {
            var w = img.width;
            var h = img.height;
            var ctx = document.createElement('canvas').getContext('2d');
            ctx.canvas.width = w;
            ctx.canvas.height = h;
            ctx.drawImage(img, 0, 0);
            var imagedata = ctx.getImageData(0, 0, w, h);
            var buff = new Uint32Array(imagedata.data.buffer);
            var pixels = [];
            for (var x = 0; x < w; ++x) {
                for (var y = 0; y < h; ++y) {
                    var index = (y * w + x);
                    var r = imagedata.data[index];
                    var g = imagedata.data[++index];
                    var b = imagedata.data[++index];
                    var a = imagedata.data[++index];
                    var color = `rgba(${r}, ${g}, ${b}, ${a})`;
                    var data = (a << 24) | (b << 16) | (g << 8) | r;
                    pixels.push(new Pixel(x, y, buff[index]));
                }
            }
            resolve(pixels, w, h);
        };
        img.src = src;
    });
}

document.addEventListener('mousemove', (e) => {
    mouse = new Vector2D(e.pageX, e.pageY);
});