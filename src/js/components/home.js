import React, { Component } from 'react';
import Intro from './intro';

class Home extends Component {

    constructor(props) {
        super(props);
        this.intro = null;
    }

    componentWillLeave(callback) {
        if (!this.intro) return callback();
        this.intro.animateOut(callback);
    }

    render() {
        return (
            <Intro ref={instance => { this.intro = instance; }} />
        );
    }

}

export default Home;