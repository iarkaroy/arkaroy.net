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
    }

    componentDidMount() {
        this.canvas = this.refs.canvas;
        this.ctx = this.canvas.getContext('2d');
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
        });
        var font = new FontFaceObserver('Montserrat', {
            weight: 900
        });
        font.load().then(this.setup, this.setup);
    }

    setup() {
        this.slices = new Slices({
            text: 'DEMO',
            angle: -45,
            segments: 20,
            fontWeight: '900',
            fontFamily: 'Montserrat',
            fillColor: '#f0f0f0'
        }).get();
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
            slice.x = (slice.y - (this.state.viewportHeight - slice.height) / 2) / Math.tan(-45 * Math.PI / 180);
            slice.x += (this.state.viewportWidth - slice.width) / 2;
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
            duration: 1000,
            delay: (target, index) => {
                return Math.floor(Math.random() * 1000);
            },
            update: this.renderCanvas,
        });
    }

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
            <canvas ref="canvas" width={this.state.viewportWidth} height={this.state.viewportHeight} />
        );
    }

}

export default Intro;