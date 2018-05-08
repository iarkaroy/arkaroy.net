import React, { Component } from 'react';
import { Link } from '../router/router';

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
                    <ul onClick={this.handleBarClick}>
                        <Link to="/">Home</Link>
                        <Link to="/projects">Projects</Link>
                    </ul>
                </div>
            </header>
        );
    }

}

export default Header;