import { useEffect, useState } from 'react';
import { Fade } from 'react-awesome-reveal';
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
    const [session, setSession] = useState<any>({});

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

    const [protoUpdate, setProtoUpdate] = useState<boolean>(false);

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
                case 'set_session':
                    setSession(data["set_session"]);
                    break;
                case 'reset_session':
                    data["reset_session"] ? setSuccessMsg("Reset session: success") : setErrorMsg("Reset session: failure");
                    if (data["reset_session"]) setSession({});
                    break;
                case 'proto_update':
                    if (data["proto_update"]) {
                        setProtoUpdate(true);
                        setLoadingPage(true);
                        setInfoMsg("New prototype : reloading");
                        setPages([{name:'404', link:''}]);
                    }
                    else {
                        postProjectGetProtoPages(projectId as string)
                        .then((data) => {
                            setPages([{name:'404', link:''}, ...data.pages]);
                            setSuccessMsg("New prototype : ready to use");
                            setLoadingPage(false);
                            setProtoUpdate(false);
                        })
                        .catch(error => {
                            // setErrorMsg("Internal error");
                            console.log("Error:", error);
                        });
                    }
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
    }, [projectId, socket]);

    useEffect(() => {
        if (!(socket && socketUsable && pages.length >= 2)) return;
        setCurrentPage(pages[1].name);
        socket.send(JSON.stringify({"action":"execute", "page": pages[1].link}))
    }, [socket, socketUsable, pages]);

    const [successMsg, setSuccessMsg] = useState<string>("");
    const [infoMsg, setInfoMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    useEffect(() => {
        if (successMsg) setTimeout(() => setSuccessMsg(""), 4000);
    }, [successMsg]);
    useEffect(() => {
        if (infoMsg) setTimeout(() => setInfoMsg(""), 4000);
    }, [infoMsg]);
    useEffect(() => {
        if (errorMsg) setTimeout(() => setErrorMsg(""), 4000);
    }, [errorMsg]);

    function triggerLink({link, name}:{link:string, name:string}) {
        if (!socket || !socketUsable) return;
        if (protoUpdate) {
            setErrorMsg("Reloading prototype");
            return;
        }
        setLoadingPage(true);
        setCurrentPage(name);
        socket.send(JSON.stringify({"action":"execute", "page": link}));
    }

    function triggerResetSession() {
        if (!socket || !socketUsable) return;
        if (protoUpdate) {
            setErrorMsg("Reloading prototype");
            return;
        }
        setInfoMsg("Send reset session request...");
        socket.send(JSON.stringify({"action":"reset_session"}));
    }

    useEffect(() => {
        function handleLinks(event:Event) {
            let index = 0;
            while (index < event.composedPath().length && (event.composedPath()[index] as HTMLElement).tagName !== "A") ++index;

            const target = (event.composedPath()[index] as HTMLElement).attributes.getNamedItem("target")?.nodeValue;
            if (target === "_blank") return;

            event.preventDefault();
            event.stopPropagation();

            const targetPage = (event.composedPath()[index] as HTMLElement).attributes.getNamedItem("href")?.nodeValue;
            if (!targetPage || !socket || !socketUsable) return;

            setLoadingPage(true);
            socket.send(JSON.stringify({"action":"execute", "page": targetPage}));
        }
        const targetElem = document.querySelector('#exec_window');
        targetElem?.addEventListener('click', handleLinks);
        return () => targetElem?.removeEventListener('click', handleLinks);
    }, [socket, socketUsable])

    return (
        <section id="proto">
            <div className='popup'>
                { successMsg && <Fade><div className='success'>{successMsg}</div></Fade> }
                { infoMsg && <Fade><div className='info'>{infoMsg}</div></Fade> }
                { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
            </div>
            <div className='session'>
                <div className="users">
                    <Collabs usernames={[userContext.user.name+" (you)", ...loggedCollabs]} />
                </div>
                <h2>Server session</h2>
                <div className='button' onClick={triggerResetSession}>Reset</div>
                <pre>{JSON.stringify(session, null, 2)}</pre>
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
