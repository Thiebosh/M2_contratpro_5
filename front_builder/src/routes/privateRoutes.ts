import {lazy} from 'react';

import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';

export const privateRoutes: object[] = [
  {
    path: '/',
    title: 'Home',
    component: Home,
  },
  {
    path: '/dashboard',
    title: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/about',
    title: 'About',
    component: lazy(() => import('../pages/About')),
  },
  {
    path: '**',
    title: 'Error',
    component: lazy(() => import('../errors/404')),
  },
];
