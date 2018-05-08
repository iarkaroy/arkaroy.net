import React, { Component } from 'react';
import routes from './routes';

let instances = [];

const register = (comp) => instances.push(comp);
const unregister = (comp) => instances.splice(instances.indexOf(comp), 1);

const historyPush = (path) => {
    history.pushState({}, null, path);
    routeWillChange(instances[0]);
}

const historyReplace = (path) => {
    history.replaceState({}, null, path);
    routeWillChange(instances[0]);
}

const matchPath = (pathname, options) => {
    const { exact = false, path } = options
    if (!path) {
        return {
            path: null,
            url: pathname,
            isExact: true,
        }
    }

    const match = new RegExp(`^${path}`).exec(pathname);

    if (!match)
        return null;

    const url = match[0];
    const isExact = pathname === url;

    if (exact && !isExact)
        return null;

    return {
        path,
        url,
        isExact,
    }
};

const routeWillChange = (router) => {
    if(router.child.componentWillLeave) {
        router.child.componentWillLeave(() => {
            router.forceUpdate();
        });
    } else {
        router.forceUpdate();
    }
};

class Router extends Component {

    constructor(props) {
        super(props);
        this.child = null;
        this.willChange = this.willChange.bind(this);
    }

    componentWillMount() {
        addEventListener('popstate', this.willChange);
        register(this);
    }

    componentWillUnmount() {
        removeEventListener('popstate', this.willChange);
        unregister(this);
    }

    willChange() {
        routeWillChange(this);
    }

    handlePop = () => {
        this.forceUpdate();
    };

    render() {
        var MatchedComponent = null;
        const len = routes.length;
        for (let i = 0; i < len; ++i) {
            const route = routes[i];
            const { path, exact = false, component } = route;
            const match = matchPath(location.pathname, { path, exact });
            
            if (match) {
                MatchedComponent = component;
                break;
            }
        }
        
        if (MatchedComponent) {
            return (
                <MatchedComponent ref={ instance => { this.child = instance; }}/>
            )
        }
        
        return null;
    }

}

class Link extends Component {

    handleClick = (event) => {
        const { to, replace } = this.props;
        event.preventDefault();
        replace ? historyReplace(to) : historyPush(to);
    };

    render() {
        const { to, children } = this.props;
        return (
            <a href={to} onClick={this.handleClick}>
                {children}
            </a>
        );
    }

}

export { Router, Link };