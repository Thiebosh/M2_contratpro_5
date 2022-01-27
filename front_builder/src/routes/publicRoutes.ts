import {lazy} from "react";

import Home from '../pages/Home';

export const publicRoutes: object[] = [
  {
    path: '/',
    title: 'Home',
    component: Home,
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
