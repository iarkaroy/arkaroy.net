import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import MenuLink from './menulink';

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
                        <li><MenuLink to="/">Home</MenuLink></li>
                        <li><MenuLink to="/projects">Projects</MenuLink></li>
                    </ul>
                </div>
            </header>
        );
    }

}

export default Header;