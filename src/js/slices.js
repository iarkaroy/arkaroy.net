
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

    constructor(options) {
        this.slices = [];
        this.options = Object.assign({}, defaults, options);
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
            self.make(img);
        };
        img.src = this.options.image;
    }

    initText() {
        var o, font, ctx, w, h;
        o = this.options;
        font = `${o.fontWeight} ${o.fontSize}px ${o.fontFamily}`;
        ctx = createContext();
        ctx.font = font;
        w = ctx.measureText(o.text).width;
        h = Math.ceil(o.fontSize * 1.2);
        ctx.canvas.width = w + 20;
        ctx.canvas.height = h;
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = o.fillColor;
        ctx.fillText(o.text, w / 2 + 10, h / 2);
        this.make(ctx.canvas);
    }

    make(image) {
        var w, h, rad, sin, cos, nw, nh, sh, i;
        var o = this.options;

        // Dimension of image
        w = image.width;
        h = image.height;

        // Convert degree to radian
        rad = o.angle * Math.PI / 180;

        // Sine and cosine of radian
        sin = Math.abs(Math.sin(rad));
        cos = Math.abs(Math.cos(rad));

        // Dimension of rotated image
        nw = w * cos + h * sin;
        nh = h * cos + w * sin;

        // Height of per piece
        sh = nh / o.segments;

        this.slices = [];
        for (i = 0; i < o.segments; ++i) {
            var ctx = createContext();
            ctx.canvas.width = w;
            ctx.canvas.height = h;
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(o.angle * Math.PI / 180);
            ctx.rect(-nw / 2, sh * i - nh / 2, nw, sh);
            ctx.restore();
            ctx.clip();
            ctx.drawImage(image, 0, 0);
            this.slices.push(new Slice(ctx.canvas));
        }
    }

    get() {
        return this.slices;
    }

}

class Slice {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
}

function createContext() {
    return document.createElement('canvas').getContext('2d');
}