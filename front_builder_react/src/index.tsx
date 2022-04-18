import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Routes,
	Route,
    Navigate
} from 'react-router-dom';
import {requireUser, userContext, userContextMethods} from './session/user';

import {NavBar} from './components/NavBar';

import {NotFound} from './pages/NotFound';
import {Home} from './pages/Home';
import {Login} from './pages/user/Login';
import {Create} from './pages/user/Create';
import {Profile} from './pages/user/Profile';
import {Projects} from './pages/Projects';
import {Project} from './pages/project/Project';
import {Specs} from './pages/project/Specs';
import {Proto} from './pages/project/Proto';

import './index.scss';

function App():JSX.Element {
    const triggerRefresh = useState<boolean>(false)[1];
    return (
        <>
            <userContext.Provider value={userContextMethods(triggerRefresh)}>
                <NavBar/>
                {/* ajouter websocket prodiver dans un composant dédié qui surveille les patterns de route et qui manipule la socket en fonction :
                si project/:name/quelque chose, crée et initie si pas déjà le cas ; sinon, ferme si pas déjà le cas */}
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate replace to="/home" />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/user/create" element={<Create/>} />
                        <Route path="/user/login" element={<Login/>} />
                        <Route path="/user/profile" element={requireUser(<Profile/>)} />
                        <Route path="/projects" element={requireUser(<Projects/>)} />
                        <Route path="/project/:name" element={requireUser(<Project/>)} />
                        <Route path="/project/:name/specs" element={requireUser(<Specs/>)} />
                        <Route path="/project/:name/proto" element={requireUser(<Proto/>)} />
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
