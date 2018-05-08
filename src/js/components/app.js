import React, { Component } from 'react';
import Header from './header';
import { Router } from '../router/router';

class App extends Component {

    render() {
        return (
            <div>
                <Header />
                <Router />
            </div>
        );
    }

}

export default App;