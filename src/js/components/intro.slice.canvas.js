import React, { Component } from 'react';

import Slices from '../slices';
import animate from '../animate';
import FontFaceObserver from 'fontfaceobserver';

class Intro extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewportWidth: 0,
            viewportHeight: 0
        };
        this.updateViewportDimension = this.updateViewportDimension.bind(this);
        this.setup = this.setup.bind(this);
        this.renderCanvas = this.renderCanvas.bind(this);
        this.animateIn = this.animateIn.bind(this);
        this.animateOut = this.animateOut.bind(this);
        this.sliceAngle = -45;
        this.withinBounds = false;
        this.frameId = 0;
    }

    componentDidMount() {
        this.canvas = this.refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.slice = null;
        this.slices = [];
        this.options = {};
        this.animation = null;
        this.updateViewportDimension();
        window.addEventListener('resize', this.updateViewportDimension);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateViewportDimension);
        document.removeEventListener('mousemove', this.onMouseMove, false);
    }

    updateViewportDimension() {
        this.setState({
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        }, () => {
            var font = new FontFaceObserver('Barlow', {
                weight: 900
            });
            font.load().then(this.setup, this.setup);
        });
    }

    setup() {
        const fontSize = 240;
        this.slice = new Slices({
            text: 'DEMO DEMO',
            angle: this.sliceAngle,
            segments: 25,
            fontWeight: '900',
            fontFamily: 'Barlow',
            fillColor: '#f0f0f0',
            fontSize: fontSize
        });

        this.slices = this.slice.get();
        const sliceWidth = this.slices[0] ? this.slices[0].width : 0;
        const sliceHeight = this.slices[0] ? this.slices[0].height : 0;
        const centerX = (this.canvas.width - sliceWidth) / 2;
        const centerY = (this.canvas.height - sliceHeight) / 2;
        const possibleYs = [
            centerY - sliceHeight,
            centerY + sliceHeight
        ];
        this.options = { sliceWidth, sliceHeight, centerX, centerY, possibleYs };
        const textHeight = fontSize * 1.2;
        const textCenterY = (this.canvas.height - textHeight) / 2;
        this.bounds = {
            x1: centerX,
            y1: textCenterY,
            x2: centerX + sliceWidth,
            y2: textCenterY + textHeight
        };

        for (var i = 0; i < this.slices.length; ++i) {
            var slice = this.slices[i];
            slice.origin(centerX, centerY); //.angle(this.sliceAngle).offset(centerY + sliceHeight).calc();
            slice.y = possibleYs[Math.floor(Math.random() * possibleYs.length)];
            slice.x = (slice.y - (this.canvas.height - slice.height) / 2) / Math.tan(-45 * Math.PI / 180);
            slice.x += (this.canvas.width - slice.width) / 2;
            slice.o = 0;
        }
        this.animateIn();
    }

    animateIn() {
        this.animation = animate({
            targets: this.slices,
            x: this.options.centerX,
            y: this.options.centerY,
            o: 1,
            easing: 'quintIn',
            duration: 600,
            delay: (target, index) => {
                return Math.floor(Math.random() * 800);
            },
            update: this.renderCanvas,
            complete: () => {
                document.addEventListener('mousemove', this.onMouseMove, false);
            }
        });
    }

    onMouseMove = (event) => {
        const { pageX, pageY } = event;
        const is = this.isInBounds(pageX * 2, pageY * 2);
        if (is && !this.withinBounds) {
            this.withinBounds = true;
            this.onEnter();
        }
        if (!is && this.withinBounds) {
            this.withinBounds = false;
            this.onLeave();
        }
    };

    onEnter = () => {
        this.slices.forEach(slice => {
            slice.angle(this.sliceAngle).offset(Math.random() * 20 + 10);
        });

        animate({
            targets: this.slices,
            x: (target, i) => {
                return Math.cos(target.options.angle * Math.PI / 180) * target.options.offset + target.options.origin.x;
            },
            y: (target, i) => {
                return Math.sin(target.options.angle * Math.PI / 180) * target.options.offset + target.options.origin.y;
            },
            easing: 'linear',
            duration: 300,
            update: this.renderCanvas,
            complete: () => {
                if (!this.frameId)
                    this.frameId = requestAnimationFrame(this.renderRotation);
            }
        });
    };

    onLeave = () => {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = 0;
        }

        animate({
            targets: this.slices,
            x: (target, i) => {
                return target.options.origin.x;
            },
            y: (target, i) => {
                return target.options.origin.y;
            },
            easing: 'linear',
            duration: 300,
            update: this.renderCanvas
        });
    };

    isInBounds = (x, y) => {
        return x >= this.bounds.x1
            && x <= this.bounds.x2
            && y >= this.bounds.y1
            && y <= this.bounds.y2;
    }

    renderRotation = () => {
        this.frameId = requestAnimationFrame(this.renderRotation);
        var t0 = performance.now();
        this.sliceAngle += 0.5;
        this.slices = this.slice.setAngle(this.sliceAngle).get();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var len = this.slices.length;
        for (var i = 0; i < len; ++i) {
            var slice = this.slices[i];
            slice.angle(this.sliceAngle).calc();
            this.ctx.drawImage(slice.canvas, slice.x, slice.y);
        }
        var t1 = performance.now();
        // console.log(t1-t0);
    };

    animateOut(callback) {
        animate({
            targets: this.slices,
            y: (target, i) => {
                target.toY = target.options.angle === 0 ? target.options.origin.y : this.options.possibleYs[Math.floor(Math.random() * this.options.possibleYs.length)];
                return target.toY;
            },
            x: (target, i) => {
                var toX;
                if (target.options.angle === 0) {
                    toX = Math.random() < 0.5 ? -target.width : this.canvas.width;
                } else {
                    toX = (target.toY - (this.canvas.height - target.height) / 2) / Math.tan(target.options.angle * Math.PI / 180);
                    toX += (this.canvas.width - target.width) / 2;
                }
                return toX;
            },
            duration: 600,
            easing: 'quintIn',
            update: this.renderCanvas,
            complete: callback
        });
    }

    renderCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var len = this.slices.length;
        for (var i = 0; i < len; ++i) {
            var slice = this.slices[i];
            this.ctx.globalAlpha = slice.o * slice.o;
            this.ctx.drawImage(slice.canvas, slice.x, slice.y);
        }
    }

    render() {
        return (
            <canvas
                ref="canvas"
                width={this.state.viewportWidth * 2}
                height={this.state.viewportHeight * 2}
                style={{ zIndex: 2, width: this.state.viewportWidth, height: this.state.viewportHeight }}
            />
        );
    }

}

export default Intro;