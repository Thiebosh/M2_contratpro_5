import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Routes,
	Route,
    Navigate
} from 'react-router-dom';
import {requireNoUser, requireUser, UserProvider, userContextMethods} from './session/user';

import {NavBar} from './components/NavBar';

import {NotFound} from './pages/NotFound';
import {Home} from './pages/Home';
import {CreateUser} from './pages/user/CreateUser';
import {Login} from './pages/user/Login';
import {Profile} from './pages/user/Profile';
import {Projects} from './pages/Projects';
import {CreateProject} from './pages/Project/CreateProject';
import {Detail} from './pages/Project/Detail';
import {Specs} from './pages/Project/Specs';
import {Proto} from './pages/Project/Proto';

import './index.scss';

export const sessionDuration = 20; //min
export const dateFormat = "YYYY/MM/DD HH:mm";

export function init_websocket(type:'specs'|'proto', projectId:string, username:string, setUsable:React.Dispatch<React.SetStateAction<boolean>>) {
    const socket = new WebSocket("ws://" + window.location.hostname + ":8002");

    socket.onopen = () => {
        console.log('connecting...');
        socket.send(JSON.stringify({
            action: "connectRoom",
            roomId: projectId,
            author: username,
            type: type
        }));
        console.log('connected');
        setUsable(true);
    };
    socket.onerror = (error) => {
        setUsable(false);
        socket.close();
        console.log(`[error] ${error}`);
    };
    socket.onclose = (event) => {
        setUsable(false);
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[close] Connection died');
        }
    };

    return socket;
}

function App():JSX.Element {
    const triggerRefresh = useState<boolean>(false)[1];
    return (
        <>
            <UserProvider value={userContextMethods(triggerRefresh)}>
                <NavBar/>
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate replace to="/home" />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/user/create" element={requireNoUser(<CreateUser/>)} />
                        <Route path="/user/login" element={requireNoUser(<Login/>)} />
                        <Route path="/user/profile" element={requireUser(<Profile/>)} />
                        <Route path="/projects" element={requireUser(<Projects/>)} />
                        <Route path="/projects/create" element={requireUser(<CreateProject/>)} />
                        <Route path="/project/:urlName" element={requireUser(<Detail/>)} />
                        <Route path="/project/:urlName/specs" element={requireUser(<Specs/>)} />
                        <Route path="/project/:urlName/proto" element={requireUser(<Proto/>)} />
                        <Route path="/*" element={<NotFound/>} />
                    </Routes>
                </Router>
            </UserProvider>
        </>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);
