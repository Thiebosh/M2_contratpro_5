import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

import './Proto.scss';

export function Proto() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();
    const [projectId, setProjectId] = useState<string>();
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        postProjectExistForUser(userContext.user.id, urlName || "")
        .then((data) => {
            if (!data.id) {
                navigate('/projects');
                return;
            }
            setProjectId(data.id);
        })
        .then(() => setSocket(new WebSocket("ws://localhost:8002")))
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user.id, urlName, navigate]);

    useEffect(() => {
        if (!projectId || !socket) return;

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
            console.log("send ",projectId, userContext.user.name)
            const msg = JSON.stringify({"action":"connectRoom", "roomName" : urlName, "author": userContext.user.name})
            socket.send(msg);
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log(data);
        };
    }, [projectId, socket, userContext.user.name]);

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
