import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CardPage } from '../../components/CardPage';
import { useUserContext } from '../../session/user';
import { postProjectExistForUser, postProjectGet } from '../../partners/rest';

import './Project.scss';

export function Project() {
    const navigate = useNavigate();
    const { name } = useParams();
    const userContext = useUserContext();

    useEffect(() => {
        postProjectExistForUser(userContext.user, name || "")
        .then((data) => data.id || navigate('/projects'))
        .then((id) => {
            if (!id) throw new Error("empty project id");

            console.log(id);
            postProjectGet(id)
            .then((data) => {
                console.log(data); // todo : mapping
            })
            .catch(error => {
                console.log("Error:", error);
            });
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, name, navigate]);

    return (
        <section id="project">
            <h1>Project Summary</h1>
            <CardPage size='large'>
                title<br/>
                collabs (+edit)<br/>
                <hr/>
                description (+edit)<br/>
            </CardPage>
        </section>
    );
}
