import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Routes,
	Route,
    Navigate
} from 'react-router-dom';
import {requireUser} from './session/user';
import {requireProject} from './session/project';

import NavBar from './components/NavBar';

import NotFound from './pages/NotFound';
import {Home} from './pages/Home';
import Project from './pages/Project';
import Projects from './pages/Projects';
import {Create} from './pages/user/Create';
import Login from './pages/user/Login';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';

import './index.scss';


ReactDOM.render(
    <React.StrictMode>
        <NavBar/>
        <Router>
            <Routes>
                <Route path="/" element={<Navigate replace to="/home" />} />
                <Route path="/home" element={<Home />} />
                <Route path="/user/create" element={<Create/>} />
                <Route path="/user/login" element={<Login/>} />
                <Route path="/user/profile" element={requireUser(<Profile/>)} />
                <Route path="/user/settings" element={requireUser(<Settings/>)} />
                <Route path="/user/projects" element={requireUser(<Projects/>)} />
                <Route path="/user/project/*" element={requireProject(requireUser(<Project/>))} />
                <Route path="/*" element={<NotFound/>} />
            </Routes>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);
