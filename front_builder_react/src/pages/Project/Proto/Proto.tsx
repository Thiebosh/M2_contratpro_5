import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

import './Proto.scss';

export function Proto() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();

    useEffect(() => {
        postProjectExistForUser(userContext.user, urlName || "")
        .then((data) => data.id || navigate('/projects'))
        .then(() => {
            const websocket = new WebSocket('ws://127.0.0.1:8002')
            websocket.onopen = () => {
                console.log('connected')
                const msg = JSON.stringify({"action":"connectRoom", "roomName" : urlName, "author": userContext.user}) // à traduire en nom ou le stocker
                websocket.send(msg);
            }
            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data)
                console.log(data);
            }
            websocket.onclose = function(event) {
                if (event.wasClean) {
                    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                } else {
                    // e.g. server process killed or network down
                    // event.code is usually 1006 in this case
                    console.log('[close] Connection died');
                }
            };
            websocket.onerror = function(error) {
                websocket.close();
                console.log(`[error] ${error}`);
            };
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, urlName, navigate]);

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
