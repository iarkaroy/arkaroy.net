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
        this.frameId = null;
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
        this.slice = new Slices({
            text: 'DEMO',
            angle: this.sliceAngle,
            segments: 20,
            fontWeight: '900',
            fontFamily: 'Barlow',
            fillColor: '#f0f0f0',
            fontSize: 240
        });
        console.log(this.slice);
        this.slices = this.slice.get();
        var sliceWidth = this.slices[0] ? this.slices[0].width : 0;
        var sliceHeight = this.slices[0] ? this.slices[0].height : 0;
        var centerX = (this.canvas.width - sliceWidth) / 2;
        var centerY = (this.canvas.height - sliceHeight) / 2;
        var possibleYs = [
            centerY - sliceHeight,
            centerY + sliceHeight
        ];
        this.options = { sliceWidth, sliceHeight, centerX, centerY, possibleYs };
        for (var i = 0; i < this.slices.length; ++i) {
            var slice = this.slices[i];
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
                if(!this.frameId)
                this.frameId = requestAnimationFrame(this.renderRot);
            }
        });
    }

    renderRot = () => {
        this.frameId = requestAnimationFrame(this.renderRot);
        this.sliceAngle += 0.5;
        this.slices = this.slice.setAngle(this.sliceAngle).get();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var len = this.slices.length;
        for (var i = 0; i < len; ++i) {
            var slice = this.slices[i];
            this.ctx.drawImage(slice.canvas, this.options.centerX, this.options.centerY);
        }
    };

    animateOut(callback) {
        this.animation.set({
            complete: callback
        }).reverse();
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