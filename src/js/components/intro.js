import React, { Component } from 'react';
import characters from '../characters';

class Intro extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewport: {
                width: 0,
                height: 0
            }
        };
        this.ctx = null;
        this.chars = [];
        this.totalWidth = 0;
        this.letterSpacing = 25;
        this.smoothing = 0.3;
        this.scale = 1;
        this.frameId = 0;
        this.timeoutId = 0;

        this.mouse = {
            position: { x: 0, y: 0 },
            direction: { x: 0, y: 0 },
            speed: { x: 0, y: 0 },
            last: { x: 0, y: 0 },
            dist: 60
        };
        this.viscosity = 20;
        this.damping = 0.05;
    }

    componentDidMount() {
        window.addEventListener('resize', this.onResize);
        document.addEventListener('mousemove', this.onMouseMove);
        this.setup();
        this.mouseSpeed();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('mousemove', this.onMouseMove);
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = 0;
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = 0;
        }
    }

    onResize = (event) => {
        this.setup();
    };

    onMouseMove = (event) => {
        var { pageX, pageY } = event;
        pageX *= 2;
        pageY *= 2;
        if (this.mouse.position.x < pageX)
            this.mouse.direction.x = 1;
        else if (this.mouse.position.x > pageX)
            this.mouse.direction.x = -1;
        else
            this.mouse.direction.x = 0;

        if (this.mouse.position.y < pageY)
            this.mouse.direction.y = 1;
        else if (this.mouse.position.y > pageY)
            this.mouse.direction.y = -1;
        else
            this.mouse.direction.y = 0;

        this.mouse.position.x = pageX;
        this.mouse.position.y = pageY;
    };

    mouseSpeed = () => {
        this.mouse.speed.x = this.mouse.position.x - this.mouse.last.x;
        this.mouse.speed.y = this.mouse.position.y - this.mouse.last.y;

        this.mouse.last.x = this.mouse.position.x;
        this.mouse.last.y = this.mouse.position.y;
        this.timeoutId = setTimeout(this.mouseSpeed, 20);
    };

    setup = () => {
        this.updateViewport(() => {
            const { width, height } = this.state.viewport;
            if (this.ctx === null)
                this.ctx = this.canvas.getContext('2d');

            if (this.totalWidth === 0)
                this.calcTotalWidth();

            this.scale = width * 0.8 / this.totalWidth;
            if(this.scale > 0.8) this.scale = 0.8;

            this.resetChars();

            if (!this.frameId)
                this.frameId = requestAnimationFrame(this.loop);
        });
    };

    loop = () => {
        this.frameId = requestAnimationFrame(this.loop);
        const { width, height } = this.state.viewport;
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'xor';
        this.chars.forEach(char => {
            char.outer.forEach(this.movePoint);
            char.inner.forEach(this.movePoint);
            this.calcCtrlPoints(char.outer);
            this.calcCtrlPoints(char.inner);
            this.drawPoints(char.outer);
            this.drawPoints(char.inner);
        });
        this.ctx.restore();
    };

    movePoint = point => {
        if (point.d > 0) {
            point.d--;
            return;
        }
        point.v.x += (point.o.x - point.p.x) / this.viscosity;
        point.v.y += (point.o.y - point.p.y) / this.viscosity;

        var dx = point.o.x - this.mouse.position.x,
            dy = point.o.y - this.mouse.position.y;
        var relDist = (1 - Math.sqrt((dx * dx) + (dy * dy)) / this.mouse.dist);

        // Move x
        if ((this.mouse.direction.x > 0 && this.mouse.position.x > point.p.x)
            || (this.mouse.direction.x < 0 && this.mouse.position.x < point.p.x)) {
            if (relDist > 0 && relDist < 1) {
                point.v.x = (this.mouse.speed.x / 4) * relDist;
            }
        }
        point.v.x *= (1 - this.damping);
        point.p.x += point.v.x;

        // Move y
        if ((this.mouse.direction.y > 0 && this.mouse.position.y > point.p.y)
            || (this.mouse.direction.y < 0 && this.mouse.position.y < point.p.y)) {
            if (relDist > 0 && relDist < 1) {
                point.v.y = (this.mouse.speed.y / 4) * relDist;
            }
        }
        point.v.y *= (1 - this.damping);
        point.p.y += point.v.y;
    };

    calcCtrlPoints = points => {
        const len = points.length;
        for (let i = 0; i < len; ++i) {

            const prev = points[(i + len - 1) % len];
            const point = points[i];
            const next = points[(i + len + 1) % len];
            const dPrev = this.distance(point, prev);
            const dNext = this.distance(point, next);

            const line = {
                x: next.p.x - prev.p.x,
                y: next.p.y - prev.p.y,
            };
            const dLine = Math.sqrt(line.x * line.x + line.y * line.y);

            point.cPrev = {
                x: point.p.x - (line.x / dLine) * dPrev * this.smoothing,
                y: point.p.y - (line.y / dLine) * dPrev * this.smoothing,
            };
            point.cNext = {
                x: point.p.x + (line.x / dLine) * dNext * this.smoothing,
                y: point.p.y + (line.y / dLine) * dNext * this.smoothing,
            };

        }
    };

    drawPoints = (points, color = '#f0f0f0') => {
        if (points.length < 1) return;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].p.x, points[0].p.y);
        for (let p = 1; p < points.length; ++p) {
            const cnx = points[(p + 0) % points.length].cNext.x;
            const cny = points[(p + 0) % points.length].cNext.y;
            const cpx = points[(p + 1) % points.length].cPrev.x;
            const cpy = points[(p + 1) % points.length].cPrev.y;
            const px = points[(p + 1) % points.length].p.x;
            const py = points[(p + 1) % points.length].p.y;
            this.ctx.bezierCurveTo(cnx, cny, cpx, cpy, px, py);
        }
        this.ctx.fillStyle = color;
        this.ctx.fill();
    };

    distance = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.p.x - p2.p.x, 2) + Math.pow(p1.p.y - p2.p.y, 2));
    };

    resetChars = () => {
        const { width, height } = this.state.viewport;
        var offsetX = (width - this.totalWidth * this.scale) / 2;
        var offsetY = 0;
        this.chars = [];
        characters.forEach(ch => {
            var char = {
                outer: [],
                inner: []
            };
            offsetY = (height - ch.height * this.scale) / 2;
            ch.outer.forEach(co => {
                char.outer.push(this.createPoint(
                    co.x * this.scale + offsetX,
                    co.y * this.scale + offsetY
                ));
            });
            ch.inner.forEach(ci => {
                char.inner.push(this.createPoint(
                    ci.x * this.scale + offsetX,
                    ci.y * this.scale + offsetY
                ));
            });
            this.chars.push(char);
            offsetX += (ch.width + this.letterSpacing) * this.scale;
        });
    };

    calcTotalWidth = () => {
        this.totalWidth = 0;
        characters.forEach((char, i) => {
            this.totalWidth += char.width;
            if (i < characters.length - 1)
                this.totalWidth += this.letterSpacing;
        });
    };

    /*
    createCharacter = () => {
        var outerPoints = [[548, 253], [548, 229], [548, 203], [552, 177], [560, 153], [574, 130], [591, 112], [614, 98], [637, 89], [664, 84], [691, 83], [718, 87], [744, 95], [764, 105], [784, 122], [801, 145], [810, 165], [816, 194], [817, 221], [817, 246], [817, 272], [817, 300], [815, 328], [808, 352], [797, 373], [783, 391], [763, 407], [741, 418], [716, 426], [692, 428], [664, 428], [637, 423], [613, 413], [590, 398], [573, 380], [561, 361], [552, 336], [548, 305], [548, 279]];
        var innerPoints = [[638, 257], [638, 235], [639, 210], [644, 184], [661, 166], [685, 161], [709, 169], [722, 186], [726, 211], [727, 233], [727, 258], [727, 283], [726, 309], [719, 333], [703, 347], [685, 351], [662, 347], [646, 332], [640, 311], [638, 285]];
        var minX = 9999, minY = 9999, maxX = 0, maxY = 0;
        outerPoints.forEach(p => {
            if (p[0] < minX) minX = p[0];
            if (p[1] < minY) minY = p[1];
            if (p[0] > maxX) maxX = p[0];
            if (p[1] > maxY) maxY = p[1];
        });
        console.log(minX, minY, maxX, maxY);
        const w = maxX - minX;
        const h = maxY - minY;
        var char = {
            letter: 'O',
            width: w,
            height: h,
            outer: [],
            inner: []
        };
        outerPoints.forEach(p => {
            char.outer.push(this.createPoint([
                p[0] - minX,
                p[1] - minY
            ]));
        });
        innerPoints.forEach(p => {
            char.inner.push(this.createPoint([
                p[0] - minX,
                p[1] - minY
            ]));
        })
        console.log(char);
    };
*/
    createPoint = (x, y) => {
        const { width, height } = this.state.viewport;
        return {
            p: {
                x: x,
                y: 0
            },
            o: {
                x,
                y
            },
            v: {
                x: 0,
                y: 0
            },
            d: Math.floor(Math.random() * 5)
        };
    };

    updateViewport(callback) {
        this.setState({
            viewport: {
                width: window.innerWidth * 2,
                height: window.innerHeight * 2
            }
        }, callback);
    }

    render() {
        const { width, height } = this.state.viewport;
        return (
            <canvas
                ref={o => { this.canvas = o; }}
                width={width}
                height={height}
                style={{ zIndex: 2, width: width / 2, height: height / 2 }}
            />
        );
    }

}

export default Intro;