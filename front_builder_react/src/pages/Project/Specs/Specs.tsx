import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';
import { CustomTree} from "../../../components/Tree/Tree";
import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';
import { init_websocket } from '../../..';

import './Specs.scss';

interface Dictionary<T> {
    [Key: string]: T;
}
export function Specs() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();
    const [socket, setSocket] = useState<WebSocket>();
    const [socketUsable, setSocketUsable] = useState<boolean>(false);

    const [successMsg, setSuccessMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    useEffect(() => {
        if (successMsg) setTimeout(() => setSuccessMsg(""), 4000);
    }, [successMsg]);
    useEffect(() => {
        if (errorMsg) setTimeout(() => setErrorMsg(""), 4000);
    }, [errorMsg]);

    useEffect(() => {
        postProjectExistForUser(userContext.user.id, urlName || "")
        .then((data) => {
            if (!data.id) {
                navigate('/projects');
                return;
            }
            setSocket(init_websocket('specs', data.id, userContext.user.name, setSocketUsable));
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
            const data:Dictionary<string> = JSON.parse(event.data)
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

        return () => socket.close();
    }, [socket]);

    function triggerGenerate() {
        // if (!socket || !socketUsable) {
            setErrorMsg("Not connected to server!");
            return;
        // }
        // socket.send(JSON.stringify({"action":"generate"}));
    }

    function triggerSave() {
        if (!socket || !socketUsable) {
            setErrorMsg("Not connected to server!");
            return;
        }
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
                { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
            </div>
            <div id="treeContent">
                <CustomTree/>
            </div>
        </section>
    );
}
