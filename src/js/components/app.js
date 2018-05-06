import React, { Component } from 'react';
import {
    Route,
    Redirect,
    Switch
} from 'react-router-dom';
import Header from './header';
import Home from './home';
import Projects from './projects';

class App extends Component {

    render() {
        return (
            <div>
                <Header />
                <Switch>
                    <Route path="/" component={Home} exact />
                    <Route path="/projects" component={Projects} />
                    <Route render={() => { return <Redirect to="/" /> }} />
                </Switch>
            </div>
        );
    }

}

export default App;