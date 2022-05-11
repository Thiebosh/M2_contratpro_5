import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { init_websocket } from '../../..';

import { postProjectExistForUser, postProjectGetProtoPages } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

import './Proto.scss';

export function Proto() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();
    const [projectId, setProjectId] = useState<string>();

    useEffect(() => {
        postProjectExistForUser(userContext.user.id, urlName || "")
        .then((data) => {
            if (!data.id) {
                navigate('/projects');
                return;
            }
            setProjectId(data.id);
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, urlName, navigate]);

    const [pages, setPages] = useState<{link:string, name:string}[]>([]);

    useEffect(() => {
        if (!projectId) return;
        postProjectGetProtoPages(projectId)
        .then((data) => setPages(data.pages))
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }, [projectId]);

    const [socket, setSocket] = useState<WebSocket>();
    const [socketUsable, setSocketUsable] = useState<boolean>(false);
    const [loadingPage, setLoadingPage] = useState<boolean>(true);

    useEffect(() => {
        if (projectId && !socketUsable) setSocket(init_websocket('proto', projectId, userContext.user.name, setSocketUsable));
    }, [projectId, userContext.user.name, socketUsable]);

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setLoadingPage(false);
            const targetElem = document.querySelector('#placeholder');
            if (!targetElem) return;
            targetElem.innerHTML = data.execute.success === 200 ? data.execute.content : "Http response error : "+data.execute.success;
        };

        return () => {
            setSocketUsable(false);
            socket.close();
        }
    }, [socket]);

    useEffect(() => {
        if (!(socket && socketUsable)) return;
        socket.send(JSON.stringify({"action":"execute", "page": ""})) // no page for default page (?)
    }, [socket, socketUsable]);

    function triggerLink(page:string) {
        if (!socket || !socketUsable) return;
        setLoadingPage(true);
        socket.send(JSON.stringify({"action":"execute", "page": page}));
    }

    useEffect(() => {
        function handleLinks(event:Event) {
            event.preventDefault();
            event.stopPropagation();

            const targetPage = (event.target as HTMLElement).attributes.getNamedItem("href")?.nodeValue;
            if (!targetPage || !socket || !socketUsable) return;

            socket.send(JSON.stringify({"action":"execute", "page": targetPage}));
        }
        const targetElem = document.querySelector('#placeholder');
        targetElem?.addEventListener('click', handleLinks);
        return () => targetElem?.removeEventListener('click', handleLinks);
    }, [socket, socketUsable])

    return (
        <section id="proto">
            <div className='links'>
                { pages.map(item => <p key={item.name} onClick={() => triggerLink(item.link)}>{item.name}</p>) }
            </div>
            <div id="exec_window">
                { socketUsable ? (loadingPage ? "Loading..." : <div id="placeholder"/>) : "Connection to server..." }
            </div>
        </section>
    );
}
