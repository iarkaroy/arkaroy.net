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
        this.points = [];
        this.divPoints = [];
        this.finalPoints = [];
        this.orderedPoints = [];
        this.sPoint = null;
        this.ePoint = null;
        this.divs = 2;
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

    onMouseMove = (event) => {
        const { pageX, pageY, altKey, ctrlKey, shiftKey } = event;
        if (shiftKey)
            this.calculateEdgeAtCol(pageX, pageY);
        else
            this.calculateEdgeAtRow(pageY, pageX);

        if (ctrlKey) {
            var nearestPoint = null;
            var dist = 9999;
            this.finalPoints.forEach(point => {
                var dx = point[0] - pageX;
                var dy = point[1] - pageY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < dist) {
                    dist = distance;
                    if (distance < 20) {
                        nearestPoint = [
                            point[0],
                            point[1]
                        ];
                    }
                }
            });
            if (nearestPoint && this.orderedPoints.indexOf(nearestPoint) < 0) {
                this.orderedPoints.push(nearestPoint);
                this.finalPoints = this.finalPoints.filter(point => {
                    return point[0] != nearestPoint[0] || point[1] != nearestPoint[1];
                });
            }
        }
    };

    onClick = (event) => {
        if (this.points.length < 1) return false;
        const point = this.points[0];
        // if (!this.sPoint) this.sPoint = point;
        // else this.ePoint = point;
        this.orderedPoints.push(point);
        this.points = [];
    };

    onKeyUp = (event) => {
        const { keyCode, altKey, ctrlKey, shiftKey } = event;
        switch (keyCode) {
            case 13:
                if (shiftKey) {
                    this.finalPoints = this.finalPoints.concat(this.divPoints);
                    this.divPoints = [];
                    this.sPoint = this.ePoint = null;
                } else if(ctrlKey) {
                    var output = '';
                    this.orderedPoints.forEach(point => {
                        output += `points.push(new Point(${point[0]}, ${point[1]}));\n`;
                    });
                    console.log(output);
                } else
                    this.calculateDivPoints();
                break;
            case 38:
                this.divs++;
                this.calculateDivPoints();
                break;
            case 40:
                this.divs--;
                this.calculateDivPoints();
                break;
        }
    }

    calculateDivPoints = () => {
        if (!this.sPoint || !this.ePoint) return false;
        var div = [
            (this.ePoint[0] - this.sPoint[0]) / this.divs,
            (this.ePoint[1] - this.sPoint[1]) / this.divs,
        ];
        this.divPoints = [];
        for (let i = 0; i <= this.divs; ++i) {
            this.divPoints.push([
                this.sPoint[0] + div[0] * i,
                this.sPoint[1] + div[1] * i,
            ]);
        }
    };

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
        // this.calculateEdges();
    };

    calculateEdgeAtRow = (y, centerX) => {
        this.points = [];
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
                    this.points.push([x, y]);
                } else if (data[nextIndex + 3] > 0 && data[prevIndex + 3] == 0) {
                    this.points.push([x, y]);
                }
            }
        }
    }

    calculateEdgeAtCol = (x, centerY) => {
        this.points = [];
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
                    this.points.push([x, y]);
                } else if (data[nextIndex + 3] > 0 && data[prevIndex + 3] == 0) {
                    this.points.push([x, y]);
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
        this.points.forEach(point => {
            this.fgCtx.beginPath();
            this.fgCtx.arc(point[0], point[1], 1, 0, 2 * Math.PI);
            this.fgCtx.fillStyle = '#fff';
            this.fgCtx.fill();
        });
        this.divPoints.forEach(point => {
            this.fgCtx.beginPath();
            this.fgCtx.arc(point[0], point[1], 1, 0, 2 * Math.PI);
            this.fgCtx.fillStyle = '#0af';
            this.fgCtx.fill();
        });
        this.finalPoints.forEach(point => {
            this.fgCtx.beginPath();
            this.fgCtx.arc(point[0], point[1], 1, 0, 2 * Math.PI);
            this.fgCtx.fillStyle = '#ff0';
            this.fgCtx.fill();
        });
        this.orderedPoints.forEach(point => {
            this.fgCtx.beginPath();
            this.fgCtx.arc(point[0], point[1], 1, 0, 2 * Math.PI);
            this.fgCtx.fillStyle = '#0f0';
            this.fgCtx.fill();
        });
        if (this.sPoint) {
            this.fgCtx.beginPath();
            this.fgCtx.arc(this.sPoint[0], this.sPoint[1], 1, 0, 2 * Math.PI);
            this.fgCtx.fillStyle = '#0af';
            this.fgCtx.fill();
        }
        if (this.ePoint) {
            this.fgCtx.beginPath();
            this.fgCtx.arc(this.ePoint[0], this.ePoint[1], 1, 0, 2 * Math.PI);
            this.fgCtx.fillStyle = '#0af';
            this.fgCtx.fill();
        }
    };

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