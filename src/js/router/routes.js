
import Home from '../components/home';
import Projects from '../components/projects';

const routes = [
    {
        path: '/',
        exact: true,
        component: Home
    },
    {
        path: '/projects',
        component: Projects
    }
];
export default routes;