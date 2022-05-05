import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

import './Proto.scss';

export function Proto() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        postProjectExistForUser(userContext.user, urlName || "")
        .then((data) => data.id || navigate('/projects'))
        .then(() => {
            setSocket(new WebSocket("ws://localhost:8002"));
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, urlName, navigate]);

    useEffect(() => {
        if (!socket) return;

        socket.onerror = (error) => {
            socket.close();
            console.log(`[error] ${error}`);
        };
        socket.onclose = (event) => {
            if (event.wasClean) {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                // e.g. server process killed or network down
                // event.code is usually 1006 in this case
                console.log('[close] Connection died');
            }
        };
        socket.onopen = () => {
            console.log('connected')
            const msg = JSON.stringify({"action":"connectRoom", "roomName" : urlName, "author": userContext.user}) // à traduire en nom ou le stocker
            socket.send(msg);
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log(data);
        };
    }, [socket]);

    // récupérer websocket prête à l'emploi

    return (
        <section id="proto">
            <div>
                fil d'ariane : liens d'accès aux pages du prototype
            </div>
            <div>
                prototype section
            </div>
        </section>
    );
}
