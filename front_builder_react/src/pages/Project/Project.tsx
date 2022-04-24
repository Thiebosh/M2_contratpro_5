import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CardPage } from '../../components/CardPage';
import { useUserContext } from '../../session/user';
import { postProjectDelete, postProjectExistForUser, postProjectGet } from '../../partners/rest';

import './Project.scss';

export function Project() {
    const navigate = useNavigate();
    const { name } = useParams();
    const userContext = useUserContext();

    const [projectId, setProjectId] = useState<string>('');

    useEffect(() => {
        postProjectExistForUser(userContext.user, name || "")
        .then((data) => data.id || navigate('/projects'))
        .then((id) => {
            if (!id) throw new Error("empty project id");

            console.log(id);
            setProjectId(id);
            postProjectGet(id)
            .then((data) => {
                console.log(data.result); // todo : mapping
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

    function triggerDelete() {
        postProjectDelete(projectId)
        .then((data) => {
            console.log(data)
            if (!data.success) {
                // setDeleteMsg("Something wrong appened");
                return;
            }
            navigate('/projects');
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }

    return (
        <section id="project">
            <h1>Project Summary</h1>
            <CardPage size='large'>
                title<br/>
                collabs (+edit)<br/>
                <hr/>
                description (+edit)<br/>
                <div className='button delete' onClick={triggerDelete}>Delete</div>
            </CardPage>
        </section>
    );
}
