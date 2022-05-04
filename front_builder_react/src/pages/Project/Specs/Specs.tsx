import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
//@ts-ignore
//import { Tree } from 'react-tree-graph';
import { CustomTree} from "../../../components/Tree/Tree";
import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

import './Specs.scss';

//react-tree-graph est installé par défaut mais il existe aussi une librairie d3 (le premier est une surcouche du second)

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

    useEffect(() => {
        postProjectExistForUser(userContext.user, urlName || "")
        .then((data) => data.id || navigate('/projects'))
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, urlName, navigate]);

    // récupérer websocket prête à l'emploi

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
