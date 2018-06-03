import React, { Component } from 'react';
import Background from './background';
import Intro from './intro';
import Title from './title';

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
            <div>
                <Background />
                <Intro />
                <Title />
            </div>
        );
    }

}

export default Home;