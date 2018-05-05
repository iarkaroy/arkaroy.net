import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {

    constructor(props) {
        super(props);
        this.handleBarClick = this.handleBarClick.bind(this);
        this.state = {
            showMenu: false
        };
    }

    handleBarClick() {
        const showMenu = this.state.showMenu;
        this.setState({
            showMenu: !showMenu
        });
    }

    render() {
        const showMenu = this.state.showMenu;
        return (
            <header className="header">
                <div className={showMenu ? 'bar closed' : 'bar'} ref="bar" onClick={this.handleBarClick}><div></div></div>
                <div className={showMenu ? 'menu open' : 'menu'}>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/projects">Projects</Link></li>
                    </ul>
                </div>
            </header>
        );
    }

}

export default Header;