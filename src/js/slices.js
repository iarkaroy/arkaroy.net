
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
        const fixedAngle = 45;
        const sin = Math.abs(Math.sin(fixedAngle * Math.PI / 180));
        const cos = Math.abs(Math.cos(fixedAngle * Math.PI / 180));
        this.image.boundingWidth = this.image.width * cos + this.image.height * sin;
        this.image.boundingHeight = this.image.height * cos + this.image.width * sin;
        this.make();
    }

    setAngle(angle = 0) {
        this.options.angle = angle;
        this.make(true);
        return this;
    }

    make(update = false) {
        var w, h, rad, sin, cos, nw, nh, sh;
        var o = this.options;

        // Dimension of image
        w = this.image.width;
        h = this.image.height;

        // Convert degree to radian
        rad = o.angle * Math.PI / 180;

        // Sine and cosine of radian
        // sin = Math.abs(Math.sin(45 * Math.PI / 180));
        // cos = Math.abs(Math.cos(45 * Math.PI / 180));

        // Dimension of rotated image
        // nw = w * cos + h * sin;
        // nh = h * cos + w * sin;

        nw = this.image.boundingWidth;
        nh = this.image.boundingHeight;

        // Height of per piece
        sh = nh / o.segments;

        if (!update)
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
            ctx.drawImage(this.image, 0, 0, w, h);
            if (update) {
                this.slices[i].canvas = ctx.canvas;
            } else {
                this.slices.push(new Slice(ctx.canvas));
            }
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
    origin(x = 0, y = 0) {
        this.options.origin = { x, y };
        return this;
    }
    offset(d = 0) {
        this.options.offset = Math.random() < 0.5 ? d : d * -1;
        return this;
    }
    angle(a = 0) {
        this.options.angle = a;
        return this;
    }
    calc() {
        const o = this.options;
        this.x = Math.cos(o.angle * Math.PI / 180) * o.offset + o.origin.x;
        this.y = Math.sin(o.angle * Math.PI / 180) * o.offset + o.origin.y;
        return this;
    }
}

function createContext() {
    return document.createElement('canvas').getContext('2d');
}