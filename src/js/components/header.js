import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {

    render() {
        return (
            <header>
                <h1>Header!</h1>
                <Link to="/">Home</Link>
                <Link to="/projects">Projects</Link>
            </header>
        );
    }

}

export default Header;