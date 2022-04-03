import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Routes,
	Route,
    Navigate
} from 'react-router-dom';

import NavBar from './components/Navbar';

import Home from './pages/Home';
import Project from './pages/Project';
import Create from './pages/user/Create';
import Login from './pages/user/Login';
import Account from './pages/user/Account';
import Settings from './pages/user/Settings';

import './index.scss';

ReactDOM.render(
    <React.StrictMode>
        <NavBar/>
        <Router>
            <Routes>
                <Route path="/" element={<Navigate replace to="/home" />} />
                <Route path="/home" element={<Home />} />
                <Route path="/project" element={<Project/>} />

                <Route path="/user/create" element={<Create/>} />
                <Route path="/user/login" element={<Login/>} />
                <Route path="/user/account" element={<Account/>} />
                <Route path="/user/settings" element={<Settings/>} />
            </Routes>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);
