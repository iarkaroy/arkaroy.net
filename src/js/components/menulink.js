import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class MenuLink extends Component {

    static contextTypes = Link.contextTypes;

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick = (e) => {
        console.log(this);
    }

    render() {
        return (
            <Link {...this.props} onClick={this.handleClick} />
        );
    }

}

export default MenuLink;