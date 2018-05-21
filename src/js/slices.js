
const defaults = {
    image: '',
    text: '',
    fontFamily: 'arial',
    fontSize: 120,
    fontWeight: 'normal',
    fillColor: 'black',
    angle: 0,
    segments: 1
};

var document = window.document;

export default class Slices {

    constructor(options = {}) {
        this.slices = [];
        this.options = Object.assign({}, defaults, options);
        this.image = null;
        if (this.options.image) {
            this.initImage();
        }
        if (this.options.text) {
            this.initText();
        }
    }

    initImage() {
        var self = this;
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
            self.image = img;
            self.make();
        };
        img.src = this.options.image;
    }

    initText() {
        var o, font, ctx, size;
        o = this.options;
        font = `${o.fontWeight} ${o.fontSize}px ${o.fontFamily}`;
        ctx = createContext();
        ctx.font = font;
        size = ctx.measureText(o.text).width + 20;
        ctx.canvas.width = size;
        ctx.canvas.height = size;
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = o.fillColor;
        ctx.fillText(o.text, size / 2, size / 2);
        this.image = ctx.canvas;
        this.make();
    }

    setAngle(angle = 0) {
        this.options.angle = angle;
        this.make();
        return this;
    }

    make() {
        var w, h, rad, sin, cos, nw, nh, sh;
        var o = this.options;

        // Dimension of image
        w = this.image.width;
        h = this.image.height;

        // Convert degree to radian
        rad = o.angle * Math.PI / 180;

        // Sine and cosine of radian
        sin = Math.abs(Math.sin(45 * Math.PI / 180));
        cos = Math.abs(Math.cos(45 * Math.PI / 180));

        // Dimension of rotated image
        nw = w * cos + h * sin;
        nh = h * cos + w * sin;

        // Height of per piece
        sh = nh / o.segments;

        this.slices = [];
        for (let i = 0; i < o.segments; ++i) {
            var ctx = createContext();
            ctx.canvas.width = w;
            ctx.canvas.height = h;
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(rad);
            ctx.rect(-nw / 2, sh * i - nh / 2, nw, sh);
            ctx.restore();
            ctx.clip();
            ctx.drawImage(this.image, 0, 0);
            this.slices.push(new Slice(ctx.canvas));
        }
    }

    get() {
        return this.slices;
    }

}

class Slice {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.options = Object.assign({}, options);
    }
}

function createContext() {
    return document.createElement('canvas').getContext('2d');
}