import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import './Project.scss';

export default function Project() {
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        console.log(id);
        // call rest to know if project id exist with user id associated. else, redirect
        navigate('/projects');
    }, []);

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
