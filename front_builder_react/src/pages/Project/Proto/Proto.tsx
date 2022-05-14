import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { init_websocket } from '../../..';
import { Collabs } from '../../../components/Collabs';

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
            setProjectId(data.project_id);
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, urlName, navigate]);

    const [pages, setPages] = useState<{link:string, name:string}[]>([{name:'Default', link:''}]);
    const [currentPage, setCurrentPage] = useState<string>("");

    useEffect(() => {
        if (!projectId) return;
        postProjectGetProtoPages(projectId)
        .then((data) => setPages([{name:'404', link:''}, ...data.pages]))
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }, [projectId]);

    const [socket, setSocket] = useState<WebSocket>();
    const [socketUsable, setSocketUsable] = useState<boolean>(false);
    const [loadingPage, setLoadingPage] = useState<boolean>(true);
    const [loggedCollabs, setLoggedCollabs] = useState<string[]>([]);

    const [initCollab, setInitCollab] = useState<string[]>([]);
    const [addCollab, setAddCollab] = useState<string>();
    const [removeCollab, setRemoveCollab] = useState<string>();
    useEffect(() => {
        if (initCollab.length) {
            setLoggedCollabs(initCollab);
            setInitCollab([]);
        }
    }, [initCollab]);
    useEffect(() => {
        if (addCollab) {
            setLoggedCollabs([...loggedCollabs, addCollab]);
            setAddCollab(undefined);
        }
    }, [addCollab, loggedCollabs]);
    useEffect(() => {
        if (removeCollab) {
            setLoggedCollabs([...loggedCollabs.filter(item => item !== removeCollab)]);
            setRemoveCollab(undefined);
        }
    }, [removeCollab, loggedCollabs]);

    useEffect(() => {
        if (projectId && !socketUsable) setSocket(init_websocket('proto', projectId, userContext.user.name, setSocketUsable));
    }, [projectId, userContext.user.name, socketUsable]);

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log(data);
            switch(Object.keys(data)[0]) {
                case 'init_collabs':
                    setInitCollab(data["init_collabs"] as string[]);
                    break;
                case 'add_collab':
                    setAddCollab(data["add_collab"] as string);
                    break;
                case 'remove_collab':
                    setRemoveCollab(data["remove_collab"] as string);
                    break;
                case 'execute':
                    setLoadingPage(false);
                    const targetElem = document.querySelector('#placeholder');
                    if (!targetElem) return;
                    targetElem.innerHTML = data["execute"]["success"] === 200 
                        ? data["execute"]["content"]
                        : `<p class='centered'>Http response error : ${data["execute"]["success"]}</p>`;
                    break;
            }
        };

        return () => {
            setSocketUsable(false);
            socket.close();
        }
    }, [socket]);

    useEffect(() => {
        if (!(socket && socketUsable && pages.length >= 2)) return;
        setCurrentPage(pages[1].name);
        socket.send(JSON.stringify({"action":"execute", "page": pages[1].link}))
    }, [socket, socketUsable, pages]);

    function triggerLink({link, name}:{link:string, name:string}) {
        if (!socket || !socketUsable) return;
        setLoadingPage(true);
        setCurrentPage(name);
        socket.send(JSON.stringify({"action":"execute", "page": link}));
    }

    useEffect(() => {
        function handleLinks(event:Event) {
            event.preventDefault();
            event.stopPropagation();

            const targetPage = (event.target as HTMLElement).attributes.getNamedItem("href")?.nodeValue;
            if (!targetPage || !socket || !socketUsable) return;

            setLoadingPage(true);
            socket.send(JSON.stringify({"action":"execute", "page": targetPage}));
        }
        const targetElem = document.querySelector('#placeholder');
        targetElem?.addEventListener('click', handleLinks);
        return () => targetElem?.removeEventListener('click', handleLinks);
    }, [socket, socketUsable])

    return (
        <section id="proto">
            <div className='session'>
                <div className="users">
                    <Collabs usernames={[userContext.user.name+" (you)", ...loggedCollabs]} />
                </div>
                <hr/>
                <div className='button'>Reset session</div>
                <code>['session']</code>
                <pre>['session']</pre>
            </div>
            <div>
                <div className='links'>
                    { pages.map(item => <p 
                        key={item.name} 
                        className={item.name === currentPage ? "selected" : ""} 
                        onClick={() => triggerLink(item)}>{item.name}
                    </p>) }
                </div>
                <div id="exec_window">
                    { socketUsable ? (loadingPage ? <p className='centered'>Loading...</p> : <div id="placeholder"/>) : <p className='centered'>Connection to server...</p> }
                </div>
            </div>
        </section>
    );
}
