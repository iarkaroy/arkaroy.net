import React, { Component } from 'react';
import { TransitionGroup } from 'react-transition-group';

import Intro from './intro';

class Home extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Intro />
        );
    }

}

export default Home;