import { useEffect/*, useState*/ } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CustomTree} from "../../../components/Tree/Tree";
import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

// import { init_websocket } from '../../..';

import './Specs.scss';

//base library
//https://github.com/react-d3-library/react-d3-library
//https://github.com/react-d3-library/react-d3-library/wiki/React-Code

//option surcouche 1 (trop limitée ?)
//https://reactjsexample.com/a-react-library-for-generating-a-tree-graph-from-data-using-d3/
//possible de faire nos propres composants enfants : https://jpb12.github.io/react-tree-graph/?path=/docs/tree-labels--jsx

//option surcouche 2 (en fait, se base sur Tree donc même lib mais meilleure exploitation)
//https://bkrem.github.io/react-d3-tree/
//https://bestofreactjs.com/repo/bkrem-react-d3-tree
//possible de render du html dans les composants enfants : https://bkrem.github.io/react-d3-tree/docs/#customizing-the-tree

//aide possible :
//https://www.youtube.com/watch?v=zDWhvARoWl8&ab_channel=vijayrajarathinam
//https://www.youtube.com/watch?v=jC-6X6HDAxQ&ab_channel=TheMuratorium


function CustomChild() {
    function trigger() {
        console.log("hello world");
    }

    return (
        <>
            <rect height="18" width="32" y="-15" className='notFill'/>
            <circle r="30" x="-50" y="-50" className='notFill'/>
            <text dx="2" onClick={trigger}>JSX</text>
            <FontAwesomeIcon icon={faPlus}/>
        </>
    );
}

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

    const data = {
        children: [
            {
                name: 'Child One'
            },
            {
                name: 'Child Two'
            },
            {
                label: <CustomChild/>,
                name: 'Child Tree'
            }
        ],
        name: 'Parent'
    }

    return (
        <section id="specs">
            <div>
                menu statique en haut à gauche avec boutons générer et enregistrer
            </div>
            <div>
                specs section
                <CustomTree/>
            </div>
        </section>
    );
}
