import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

import { CardPage } from '../../../components/CardPage';
import { Collabs } from '../../../components/Collabs';
import { useUserContext } from '../../../session/user';
import { postProjectDelete, postProjectExistForUser, postProjectGet } from '../../../partners/rest';

import { dateFormat } from '../../..';

import './Detail.scss';

export function Detail() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userId = useUserContext().user;

    const [projectId, setProjectId] = useState<string>('');
    const [projectName, setProjectName] = useState<string>('');
    const [projectCreation, setProjectCreation] = useState<string>('');
    const [projectUsers, setProjectUsers] = useState<{id:string, name:string}[]>([]);
    const [projectLastSpecs, setProjectLastSpecs] = useState<string>('');
    const [projectLastProto, setProjectLastProto] = useState<string>('');

    useEffect(() => {
        postProjectExistForUser(userId, urlName || "")
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
    }, [userId, urlName, navigate]);

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
        <section id="projectdetail">
            <h1>Project Summary</h1>
            <CardPage size='large'>
                name: {projectName}<br/>
                <Collabs usernames={projectUsers.filter(item => item.id != userId).map(item => item.name)}/><br/>
                <hr/>
                creation: {moment(projectCreation).format(dateFormat)}<br/>
                last specs: {moment(projectLastSpecs).format(dateFormat)}<br/>
                last proto: {moment(projectLastProto).format(dateFormat)}<br/>
                <hr/>
                description<br/>
                <div className='button'>Edit</div>
                <div className='button delete' onClick={triggerDelete}>Delete</div>
            </CardPage>
        </section>
    );
}
