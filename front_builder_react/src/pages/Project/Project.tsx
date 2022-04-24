import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CardPage } from '../../components/CardPage';
import { useUserContext } from '../../session/user';
import { postProjectDelete, postProjectExistForUser, postProjectGet } from '../../partners/rest';

import './Project.scss';

export function Project() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();

    const [projectId, setProjectId] = useState<string>('');
    const [projectName, setProjectName] = useState<string>('');
    const [projectCreation, setProjectCreation] = useState<string>('');
    const [projectUsers, setProjectUsers] = useState<{id:string, name:string}[]>([]);
    const [projectLastSpecs, setProjectLastSpecs] = useState<string>('');
    const [projectLastProto, setProjectLastProto] = useState<string>('');

    useEffect(() => {
        postProjectExistForUser(userContext.user, urlName || "")
        .then((data) => data.id || navigate('/projects'))
        .then((id) => {
            if (!id) throw new Error("empty project id");
            setProjectId(id);

            postProjectGet(id)
            .then((data) => {
                setProjectName(data.result.name);
                setProjectCreation(data.result.creation);
                setProjectUsers(data.result.users);
                setProjectLastSpecs(data.result.last_specs || '');
                setProjectLastProto(data.result.last_proto || '');
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
    }, [userContext.user, urlName, navigate]);

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
                name: {projectName}<br/>
                collabs: <div>{projectUsers.map((item) => (<div key={item.id}>{item.name}</div>))}</div><br/>
                <hr/>
                creation: {projectCreation}<br/>
                last specs: {projectLastSpecs}<br/>
                last proto: {projectLastProto}<br/>
                <hr/>
                description (+edit)<br/>
                <div className='button delete' onClick={triggerDelete}>Delete</div>
            </CardPage>
        </section>
    );
}
