import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Routes,
	Route,
    Navigate
} from 'react-router-dom';
import {requireUser, userContext, userContextMethods} from './session/user';

import NavBar from './components/NavBar';

import {NotFound} from './pages/NotFound';
import {Home} from './pages/Home';
import Project from './pages/Project';
import Projects from './pages/Projects';
import {Create} from './pages/user/Create';
import {Login} from './pages/user/Login';
import {Profile} from './pages/user/Profile';

import './index.scss';

function App():JSX.Element {
    const triggerRefresh = useState<boolean>(false)[1];

    return (
        <>
            <userContext.Provider value={userContextMethods(triggerRefresh)}>
                <NavBar/>
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate replace to="/home" />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/user/create" element={<Create/>} />
                        <Route path="/user/login" element={<Login/>} />
                        <Route path="/user/profile" element={requireUser(<Profile/>)} />
                        <Route path="/projects" element={requireUser(<Projects/>)} />
                        <Route path="/project/:name" element={requireUser(<Project/>)} />
                        <Route path="/*" element={<NotFound/>} />
                    </Routes>
                </Router>
            </userContext.Provider>
        </>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);
