import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';
import { CustomTree} from "../../../components/Tree/Tree";
import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';
import { init_websocket } from '../../..';

import './Specs.scss';

export function Specs() {
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

    const [socket, setSocket] = useState<WebSocket>();
    const [socketUsable, setSocketUsable] = useState<boolean>(false);
    // const [loadingPage, setLoadingPage] = useState<boolean>(true);

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
                case 'save':
                    data["save"] ? setSuccessMsg("save: success") : setErrorMsg("save: failure");
                    break;
                case 'generate':
                    data["generate"] ? setSuccessMsg("generate: success") : setErrorMsg("generate: failure");
                    break;
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
        <section id="specs">
            <div id="menu">
                <p onClick={triggerSave}>Save specifications</p>
                <hr/>
                <p onClick={triggerGenerate}>Generate prototype</p>
            </div>
            <div className='popup'>
                { successMsg && <Fade><div className='success'>{successMsg}</div></Fade> }
                { infoMsg && <Fade><div className='info'>{infoMsg}</div></Fade> }
                { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
            </div>
            <div id="treeContent">
                <CustomTree/>
            </div>
            {/* { socketUsable ? (loadingPage ? <p className='centered'>Loading...</p> : <div id="placeholder"/>) : <p className='centered'>Connection to server...</p> } */}
        </section>
    );
}
