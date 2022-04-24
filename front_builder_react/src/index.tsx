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
import {CreateUser} from './pages/user/CreateUser';
import {Login} from './pages/user/Login';
import {Profile} from './pages/user/Profile';
import {Projects} from './pages/Projects';
import {CreateProject} from './pages/Project/CreateProject';
import {Project} from './pages/Project';
import {Specs} from './pages/Project/Specs';
import {Proto} from './pages/Project/Proto';

import './index.scss';

function App():JSX.Element {
    const triggerRefresh = useState<boolean>(false)[1];
    return (
        <>
            <userContext.Provider value={userContextMethods(triggerRefresh)}>
                <NavBar/>
                {/* ajouter websocket prodiver dans un composant dédié qui surveille les patterns de route et qui manipule la socket en fonction :
                si project/:name/quelque chose, crée et initie si pas déjà le cas ; sinon, ferme si pas déjà le cas */}
                {/* https://dev.to/itays123/using-websockets-with-react-js-the-right-way-no-library-needed-15d0 */}
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate replace to="/home" />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/user/create" element={<CreateUser/>} />
                        <Route path="/user/login" element={<Login/>} />
                        <Route path="/user/profile" element={requireUser(<Profile/>)} />
                        <Route path="/projects" element={requireUser(<Projects/>)} />
                        <Route path="/projects/create" element={requireUser(<CreateProject/>)} />
                        <Route path="/project/:urlName" element={requireUser(<Project/>)} />
                        <Route path="/project/:urlName/specs" element={requireUser(<Specs/>)} />
                        <Route path="/project/:urlName/proto" element={requireUser(<Proto/>)} />
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
