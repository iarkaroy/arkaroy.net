import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import events from '../event-system';

class MenuLink extends Component {

    static contextTypes = Link.contextTypes;

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.readyToLeave = this.readyToLeave.bind(this);
    }

    componentDidMount() {
        events.subscribe('route.can.leave', this.readyToLeave);
    }

    componentWillUnmount() {
        events.unsubscribe('route.can.leave', this.readyToLeave);
    }

    readyToLeave(data) {
        const { history, route } = this.context.router;
        if(history.location.pathname !== data) {
            history.push(data);
        }
    }

    handleClick = (e) => {
        const { to } = this.props;
        const { history, route } = this.context.router;
        e.preventDefault();
        if (route.location.pathname !== to) {
            events.publish('route.will.leave', to);
        }
    }

    render() {
        return (
            <Link {...this.props} onClick={this.handleClick} />
        );
    }

}

export default MenuLink;