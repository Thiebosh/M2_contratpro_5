import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';
import moment from 'moment';

import { Collabs } from '../../../components/Collabs';
import { useUserContext } from '../../../session/user';
import { postProjectDelete, postProjectExistForUser, postProjectGet } from '../../../partners/rest';

import { dateFormat } from '../../..';

import './Detail.scss';

interface EditProps {
    editOff: () => void,
    projectId:string,
    // setName: React.Dispatch<React.SetStateAction<string>>
};
function Edit(props:EditProps) {
    const navigate = useNavigate();
    // const userContext = useUserContext();

    const projectId = props.projectId;

    // const [name, setName] = useState<string>("");
    // const [password, setPassword] = useState<string>("");
    // const [passwordCheck, setPasswordCheck] = useState<string>("");
    const [warnMsg, setWarnMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [deleteMsg, setDeleteMsg] = useState<string>("");

    useEffect(() => { warnMsg && setTimeout(() => setWarnMsg(""), 4000) }, [warnMsg]);
    useEffect(() => { errorMsg && setTimeout(() => setErrorMsg(""), 4000) }, [errorMsg]);
    useEffect(() => { deleteMsg && setTimeout(() => setDeleteMsg(""), 4000) }, [deleteMsg]);

    function triggerUpdate() {
        props.editOff();
        // if (!(name || password || passwordCheck)) {
        //     props.editOff();
        //     return;
        // }

        // if (!(name || (password && passwordCheck))) {
        //     setWarnMsg("Empty field(s)");
        //     return;
        // }

        // if (password !== passwordCheck) {
        //     setWarnMsg("Differents passwords");
        //     return;
        // }

        // postAccountUpdate(userContext.user, name, password)
        // .then((data) => {
        //     if (data.success === "already exist") {
        //         setErrorMsg("Username already used");
        //         return;
        //     }
        //     props.setName(name);
        //     props.editOff();
        // })
        // .catch(error => {
        //     setErrorMsg("Internal error");
        //     console.log("Error:", error);
        // });
    }

    function triggerDelete() {
        postProjectDelete(projectId)
        .then((data) => {
            console.log(data)
            if (!data.success) {
                setDeleteMsg("Something wrong appened");
                return;
            }
            navigate('/projects');
        })
        .catch(error => {
            setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }

    return (
        <>
            {/* <div className='input_group'>
                <label>Change your username</label>
                <input type='text' onChange={(event) => setName(event.target.value)}/>
            </div>
            <div className='input_group'>
                <label>Change your password</label>
                <input type='password'  onChange={(event) => setPassword(event.target.value)}/>
            </div>
            <div className='input_group'>
                <label>Password check</label>
                <input type='password'  onChange={(event) => setPasswordCheck(event.target.value)}/>
            </div> */}
            <div className='button' onClick={triggerUpdate}>Confirm</div>
            { warnMsg && <Fade><div className='warning'>{warnMsg}</div></Fade> }
            { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
            <div className='button delete' onClick={triggerDelete}>Delete</div>
            { deleteMsg && <Fade><div className='error'>{deleteMsg}</div></Fade> }
        </>
    );
}

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

    const [edit, setEdit] = useState<boolean>(false);

    const editOn = () => setEdit(true);
    const editOff = () => setEdit(false);

    const nullableDate = (date:string) => (date && moment(date).format(dateFormat)) || <>-</>;

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

    return (
        <section id="detail">
            <h1>Project Summary</h1>
            <div className='card large'>
                <h1>{projectName}</h1>
                <Collabs usernames={projectUsers.filter(item => item.id !== userId).map(item => item.name)}/><br/>
                <hr/>
                <h2>Statistics</h2>
                <table>
                    <tr>
                        <th>Project creation date</th>
                        <th>:</th>
                        <td>{moment(projectCreation).format(dateFormat)}</td>
                    </tr>
                    <tr>
                        <th>Last specifications update</th>
                        <th>:</th>
                        <td>{nullableDate(projectLastSpecs)}</td>
                    </tr>
                    <tr>
                        <th>Last prototype generation</th>
                        <th>:</th>
                        <td>{nullableDate(projectLastProto)}</td>
                    </tr>
                </table>
                <hr/>
                <h2>Description</h2>
                <p>...</p>
                { edit ? <Edit editOff={editOff} projectId={projectId}/> : <div className='button' onClick={editOn}>Edit</div>}
            </div>
        </section>
    );
}
