import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { init_websocket } from '../../..';

import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

import './Proto.scss';

export function Proto() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        postProjectExistForUser(userContext.user.id, urlName || "")
        .then((data) => {
            if (!data.id) {
                navigate('/projects');
                return;
            }
            setSocket(init_websocket('proto', data.id, userContext.user.name));
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, urlName, navigate]);

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log(data);
        };

        return () => socket.close();
    }, [socket]);

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
