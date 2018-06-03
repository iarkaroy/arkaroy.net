import React, { Component } from 'react';

class Background extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewport: {
                width: 0,
                height: 0
            }
        };
        this.ctx = null;
        this.balls = [];
        this.radius = 60;
        this.frameId = 0;
    }

    componentDidMount() {
        this.setup();
        window.addEventListener('resize', this.setup);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setup);
        if(this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = 0;
        }
    }

    setup = () => {
        this.updateViewport(() => {
            if (!this.ctx)
                this.ctx = this.canvas.getContext('2d');

            const area = 1.4 * this.radius * this.radius;
            const totalArea = this.state.viewport.width * this.state.viewport.height;
            const count = Math.ceil(totalArea / area);
            this.balls = [];
            for (let i = 0; i < count; ++i) {
                this.balls.push(this.createBall());
            }
            if (!this.frameId)
                this.frameId = requestAnimationFrame(this.loop);
        });
    };

    loop = () => {
        this.frameId = requestAnimationFrame(this.loop);
        const { width, height } = this.state.viewport;
        this.ctx.clearRect(0, 0, this.state.viewport.width, this.state.viewport.height);
        this.balls.forEach(ball => {
            ball.x += ball.vx;
            ball.y += ball.vy;
            if (ball.x > width) {
                ball.x = width;
                ball.vx *= -1;
            }
            if (ball.x < 0) {
                ball.x = 0;
                ball.vx *= -1;
            }
            if (ball.y > height) {
                ball.y = height;
                ball.vy *= -1;
            }
            if (ball.y < 0) {
                ball.y = 0;
                ball.vy *= -1;
            }
            this.ctx.beginPath();
            this.ctx.fillStyle = '#000';
            this.ctx.arc(ball.x, ball.y, this.radius, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    createBall = () => {
        return {
            x: Math.random() * this.state.viewport.width,
            y: Math.random() * this.state.viewport.height,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1
        };
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
        return (
            <div>
                <canvas ref={o => { this.canvas = o; }} width={this.state.viewport.width} height={this.state.viewport.height} style={{ filter: 'url(#liquid)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                    <defs>
                        <filter id="liquid">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -10" />
                        </filter>
                    </defs>
                </svg>
            </div>
        );
    }

}

export default Background;