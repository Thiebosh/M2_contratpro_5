import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';
import { CustomTree} from "../../../components/Tree/Tree";
import { postProjectExistForUser, postProjectGetSyntaxId } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';
import { init_websocket } from '../../..';

import './Specs.scss';
import { Collabs } from '../../../components/Collabs';
import { Modal } from "../../../components/Modal"

export function Specs() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();
    const [projectId, setProjectId] = useState<string>();
    const [syntaxId, setSyntaxId] = useState<string>();
    const [isOpen, setIsOpen] = useState(false);
    const [modalElements, setModalElements] = useState([]);

    useEffect(() => {
        postProjectExistForUser(userContext.user.id, urlName || "")
        .then((data) => {
            setProjectId(data.project_id);

            postProjectGetSyntaxId(data.project_id)
            .then((data) => {
                setSyntaxId(data.id);
            })
            .catch(error => {
                // setErrorMsg("Internal error");
                console.log("Error:", error);
                navigate('/projects');
            });
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user.id, urlName, navigate]);

    const [socket, setSocket] = useState<WebSocket>();
    const [socketUsable, setSocketUsable] = useState<boolean>(false);
    // const [loadingPage, setLoadingPage] = useState<boolean>(true);
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
        if (projectId && !socketUsable) {
            // setLoadingPage(true);
            setSocket(init_websocket('specs', projectId, userContext.user.name, setSocketUsable));
        }
    }, [projectId, userContext.user.name, socketUsable]);

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            // setLoadingPage(false);
            const data:Record<string, unknown> = JSON.parse(event.data)
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

                case 'save':
                    data["save"] ? setSuccessMsg("Save: success") : setErrorMsg("Save: failure");
                    break;
                case 'generate':
                    data["generate"] ? setSuccessMsg("Generate: success") : setErrorMsg("Generate: failure");
                    break;

                case "create":
                    break
                
            }
        };

        return () => {
            setSocketUsable(false);
            socket.close();
        }
    }, [socket]);

    useEffect(() => {
        if (!(socket && socketUsable)) return;
        // socket.send(JSON.stringify({"action":"execute", "page": ""})) // init if needed
    }, [socket, socketUsable]);

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

    function triggerGenerate() {
        if (!socket || !socketUsable) {
            setErrorMsg("Not connected to server!");
            return;
        }
        setInfoMsg("Send generation request...");
        socket.send(JSON.stringify({"action":"generate"}));
    }

    function triggerSave() {
        if (!socket || !socketUsable) {
            setErrorMsg("Not connected to server!");
            return;
        }
        setInfoMsg("Send save request...");
        socket.send(JSON.stringify({"action":"save"}));
    }

    return (
        <section id="specs" className={isOpen ? "overlay": ""}>
            <div className={"hover_menu" + (isOpen ? " inactive" : "")}>
                <div className="menu">
                    <p onClick={triggerSave}>Save specifications</p>
                    <hr/>
                    <p onClick={triggerGenerate}>Generate prototype</p>
                </div>
                <div className="users">
                    <Collabs usernames={[userContext.user.name+" (you)", ...loggedCollabs]} />
                </div>
            </div>
            <div className='popup'>
                { successMsg && <Fade><div className='success'>{successMsg}</div></Fade> }
                { infoMsg && <Fade><div className='info'>{infoMsg}</div></Fade> }
                { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
            </div>
            <div id="treeContent" className={isOpen ? "inactive": ""}>
                { syntaxId &&
                    <CustomTree syntax_filename={syntaxId} openClose={setIsOpen} socket={socket} setModalElements={setModalElements}/>
                }
            </div>
            <div>
                {isOpen && (
                    <Modal openClose={setIsOpen} elements={modalElements}/>
                )}
            </div>
            {/* { socketUsable ? (loadingPage ? <p className='centered'>Loading...</p> : <div id="placeholder"/>) : <p className='centered'>Connection to server...</p> } */}
        </section>
    );
}
