import React, { Component } from 'react';
import FontFaceObserver from 'fontfaceobserver';

class Intro extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewport: {
                width: 0,
                height: 0
            }
        };
        this.bgCtx = null;
        this.fgCtx = null;
        this.bgImageData = null;
        this.hrPoints = [];
        this.vrPoints = [];
        this.currPoint = null;
        this.points = [];
        this.editMode = false;
        this.dragging = false;
        this.selectedPoint = -1;
    }

    componentDidMount() {
        this.updateViewport(() => {
            this.bgCtx = this.bg.getContext('2d');
            this.fgCtx = this.fg.getContext('2d');
            const font = new FontFaceObserver('Barlow', {
                weight: 900
            });
            font.load().then(this.updateBg, this.updateBg);
        });
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('click', this.onClick);
        document.addEventListener('keyup', this.onKeyUp);
        requestAnimationFrame(this.renderFg);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('click', this.onClick);
        document.removeEventListener('keyup', this.onKeyUp);
    }

    onMouseDown = event => {
        const { pageX, pageY } = event;
        this.points.forEach((point, index) => {
            const dx = pageX - point.x;
            const dy = pageY - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 4) {
                this.selectedPoint = index;
                this.dragging = true;
            }
        });
    };

    onMouseUp = event => {
        this.dragging = false;
    };

    onMouseMove = event => {
        const { pageX, pageY, altKey, ctrlKey, shiftKey } = event;
        if (this.editMode) {
            if (this.dragging && this.selectedPoint >= 0) {
                this.points[this.selectedPoint] = {
                    x: pageX,
                    y: pageY
                };
            }
        } else {
            if (shiftKey) this.calculateEdgeAtCol(pageX, pageY);
            else this.calculateEdgeAtRow(pageY, pageX);
        }

    };

    onClick = (event) => {
        if (!this.currPoint || this.editMode) return false;
        this.points.push({
            x: this.currPoint[0],
            y: this.currPoint[1]
        });
        this.currPoint = null;
        console.log(this.points);
    };

    onKeyUp = (event) => {
        const { keyCode, altKey, ctrlKey, shiftKey } = event;
        switch (keyCode) {
            case 13:
                if (ctrlKey) {
                    var output = '';
                    this.points.forEach(point => {
                        output += `points.push(new Point(${point.x}, ${point.y}));\n`;
                    });
                    console.log(output);
                } else {
                    this.editMode = !this.editMode;
                }
                break;
            case 37:
                if (this.selectedPoint > -1) this.points[this.selectedPoint].x--;
                break;
            case 38:
                if (this.selectedPoint > -1) this.points[this.selectedPoint].y--;
                break;
            case 39:
                if (this.selectedPoint > -1) this.points[this.selectedPoint].x++;
                break
            case 40:
                if (this.selectedPoint > -1) this.points[this.selectedPoint].y++;
                break;
        }
    }

    updateBg = () => {
        const text = 'F';
        const font = `900 480px Barlow, sans-serif`;
        const { width, height } = this.state.viewport;
        this.bgCtx.textBaseline = 'middle';
        this.bgCtx.textAlign = 'center';
        this.bgCtx.fillStyle = '#fff';
        this.bgCtx.font = font;
        this.bgCtx.fillText(text, width / 2, height / 2);
        this.bgImageData = this.bgCtx.getImageData(0, 0, width, height);
    };

    calculateEdgeAtRow = (y, centerX) => {
        const { width, height, data } = this.bgImageData;
        const xMin = centerX - 20;
        const xMax = centerX + 20;
        for (let x = xMin; x < xMax; ++x) {
            let index = y * width + x;
            index *= 4;
            if (data[index + 3] > 0) {
                const prevIndex = index - 4;
                const nextIndex = index + 4;
                if (data[prevIndex + 3] > 0 && data[nextIndex + 3] == 0) {
                    this.currPoint = [x, y];
                } else if (data[nextIndex + 3] > 0 && data[prevIndex + 3] == 0) {
                    this.currPoint = [x, y];
                }
            }
        }
    }

    calculateEdgeAtCol = (x, centerY) => {
        const { width, height, data } = this.bgImageData;
        const yMin = centerY - 20;
        const yMax = centerY + 20;
        for (let y = yMin; y < yMax; ++y) {
            let index = y * width + x;
            index *= 4;
            if (data[index + 3] > 0) {
                const prevIndex = index - width * 4;
                const nextIndex = index + width * 4;
                if (data[prevIndex + 3] > 0 && data[nextIndex + 3] == 0) {
                    this.currPoint = [x, y];
                } else if (data[nextIndex + 3] > 0 && data[prevIndex + 3] == 0) {
                    this.currPoint = [x, y];
                }
            }
        }
    };

    calculateEdges = () => {
        setTimeout(this.calculateHorizontalEdges, 0);
        setTimeout(this.calculateVerticalEdges, 0);
    };

    calculateHorizontalEdges = () => {
        const { width, height, data } = this.bgImageData;
        for (let y = 0; y < height; y += 2) {
            for (let x = 0; x < width; ++x) {
                let index = y * width + x;
                index *= 4;
                if (data[index + 3] > 0) {
                    const prevIndex = index - 4;
                    const nextIndex = index + 4;
                    if (data[prevIndex + 3] > 0 && data[nextIndex + 3] == 0) {
                        this.hrPoints.push([x, y]);
                    } else if (data[nextIndex + 3] > 0 && data[prevIndex + 3] == 0) {
                        this.hrPoints.push([x, y]);
                    }
                }
            }
        }
    };

    calculateVerticalEdges = () => {
        const { width, height, data } = this.bgImageData;
        for (let x = 0; x < width; x += 2) {
            for (let y = 0; y < height; ++y) {
                let index = y * width + x;
                index *= 4;
                if (data[index + 3] > 0) {
                    const prevIndex = index - width * 4;
                    const nextIndex = index + width * 4;
                    if (data[prevIndex + 3] > 0 && data[nextIndex + 3] == 0) {
                        this.vrPoints.push([x, y]);
                    } else if (data[nextIndex + 3] > 0 && data[prevIndex + 3] == 0) {
                        this.vrPoints.push([x, y]);
                    }
                }
            }
        }
    };

    renderFg = () => {
        requestAnimationFrame(this.renderFg);
        this.fgCtx.clearRect(0, 0, this.state.viewport.width, this.state.viewport.height);
        if (this.currPoint) {
            this.fgCtx.beginPath();
            this.fgCtx.arc(this.currPoint[0], this.currPoint[1], 1, 0, 2 * Math.PI);
            this.fgCtx.fillStyle = '#fff';
            this.fgCtx.fill();
        };
        const radius = this.editMode ? 4 : 1;
        this.points.forEach((point, index) => {
            this.fgCtx.beginPath();
            this.fgCtx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
            this.fgCtx.fillStyle = '#0f0';
            this.fgCtx.strokeStyle = '#0f0';
            this.fgCtx.lineWidth = 1;
            this.editMode ? this.fgCtx.stroke() : this.fgCtx.fill();
            if (this.selectedPoint === index) this.fgCtx.fill();
        });
        if (this.editMode) {
            const len = this.points.length;
            for (let i = 0; i < len; ++i) {
                const prev = this.points[(i + len - 1) % len];
                const point = this.points[i];
                const next = this.points[(i + len + 1) % len];
                const dPrev = this.distance(point, prev);
                const dNext = this.distance(point, next);

                const line = {
                    x: next.x - prev.x,
                    y: next.y - prev.y,
                };
                const dLine = Math.sqrt(line.x * line.x + line.y * line.y);

                point.cPrev = {
                    x: point.x - (line.x / dLine) * dPrev * 0.4,
                    y: point.y - (line.y / dLine) * dPrev * 0.4,
                };
                point.cNext = {
                    x: point.x + (line.x / dLine) * dNext * 0.4,
                    y: point.y + (line.y / dLine) * dNext * 0.4,
                };
            }
            this.fgCtx.beginPath();
            this.fgCtx.moveTo(this.points[0].x - 300, this.points[0].y);
            for (let p = 1; p < len; ++p) {
                const cnx = this.points[(p + 0) % len].cNext.x;
                const cny = this.points[(p + 0) % len].cNext.y;
                const cpx = this.points[(p + 1) % len].cPrev.x;
                const cpy = this.points[(p + 1) % len].cPrev.y;
                const px = this.points[(p + 1) % len].x;
                const py = this.points[(p + 1) % len].y;
                this.fgCtx.bezierCurveTo(cnx - 300, cny, cpx - 300, cpy, px - 300, py);
            }
            this.fgCtx.closePath();
            this.fgCtx.strokeStyle = '#fff';
            this.fgCtx.stroke();
        }
    };

    distance = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    updateViewport = (callback) => {
        this.setState({
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        }, callback);
    };

    render() {
        const { width, height } = this.state.viewport;
        return (
            <div>
                <canvas ref={o => { this.bg = o; }} width={width} height={height} style={{ zIndex: 2, opacity: 0.2 }} />
                <canvas ref={o => { this.fg = o; }} width={width} height={height} style={{ zIndex: 3 }} />
            </div>
        );
    }

}

export default Intro;