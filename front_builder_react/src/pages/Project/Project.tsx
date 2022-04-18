import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { postProjectExistForUser } from '../../partners/rest';
import { useUserContext } from '../../session/user';

import './Project.scss';

export default function Project() {
    const navigate = useNavigate();
    const { id } = useParams();
    const userContext = useUserContext();

    useEffect(() => {
        postProjectExistForUser(userContext.user, id || "")
        .then((data) => {
            console.log(data);
            // data.result || navigate('/projects')
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            // navigate('/projects');
        });
    }, [userContext.user, id, navigate]);

    return (
        <div id="project">
            Project page
            display one project
            - needs (with compile)
            - prototype
            - settings
        </div>
    );
}
