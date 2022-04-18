import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

import './Specs.scss';

export function Specs() {
    const navigate = useNavigate();
    const { name } = useParams();
    const userContext = useUserContext();

    useEffect(() => {
        postProjectExistForUser(userContext.user, name || "")
        .then((data) => {
            if (!data.id) navigate('/projects');
            console.log(data.id);
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, name, navigate]);

    // récupérer websocket prête à l'emploi

    return (
        <section id="specs">
            <div>
                menu statique en haut à gauche avec boutons générer et enregistrer
            </div>
            <div>
                specs section : arbre d'antoine
            </div>
        </section>
    );
}
