import React, { Component } from 'react';
import { Link } from '../router/router';
import ShapeOverlays from '../shape-overlays';

class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menuOpened: false
        };
    }

    componentDidMount() {
        this.overlays = document.querySelector('.shape-overlays');
        this.overlay = new ShapeOverlays(this.overlays);
    }

    handleBarClick = (event) => {
        if (this.overlay.isAnimating)
            return false;
        this.overlay.toggle();
        this.setState({
            menuOpened: this.overlay.isOpened === true
        });
    };

    render() {
        return (
            <header className="header">
                <div className={this.state.menuOpened ? 'bar closed' : 'bar'} ref="bar" onClick={this.handleBarClick}><div></div></div>
                <div className={this.state.menuOpened ? 'menu opened' : 'menu'}>
                    <ul onClick={this.handleBarClick}>
                        <Link to="/">Home</Link>
                        <Link to="/projects">Projects</Link>
                    </ul>
                </div>
                <svg className="shape-overlays" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path className="shape-overlays__path"></path>
                    <path className="shape-overlays__path"></path>
                </svg>
            </header>
        );
    }

}

export default Header;