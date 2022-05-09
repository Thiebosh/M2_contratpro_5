import { useEffect/*, useState*/ } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomTree} from "../../../components/Tree/Tree";
import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';
// import { init_websocket } from '../../..';

import './Specs.scss';

export function Specs() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();
    // const [socket, setSocket] = useState<WebSocket>();
    // const [socketUsable, setSocketUsable] = useState<boolean>(false);

    useEffect(() => {
        postProjectExistForUser(userContext.user.id, urlName || "")
        .then((data) => {
            if (!data.id) {
                navigate('/projects');
                return;
            }
            // setSocket(init_websocket('specs', data.id, userContext.user.name, setSocketUsable));
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, urlName, navigate]);

    // useEffect(() => {
    //     if (!socket) return;

    //     socket.onmessage = (event) => {
    //         const data = JSON.parse(event.data)
    //         console.log(data);
    //     };

    //     return () => socket.close();
    // }, [socket]);

    return (
        <section id="specs">
            <div id="menu">
                <p>bouton générer</p>
                <hr/>
                <p>bouton enregistrer</p>
            </div>
            <div id="treeContent">
                <CustomTree/>
            </div>
        </section>
    );
}
