import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {

    render() {
        return (
            <header className="header">
                <h1>ARKA ROY</h1>
                <div className="bar"><div></div></div>
                <ul className="menu">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/projects">Projects</Link></li>
                </ul>
            </header>
        );
    }

}

export default Header;