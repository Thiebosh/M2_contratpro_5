import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Fade} from 'react-awesome-reveal';

import {Collab, Collabs, CollabsInput, RemoveCollabsInput} from '../../../components/Collabs';
import {useUserContext} from '../../../session/user';
import {postProjectDelete, postProjectExistForUser, postProjectGet, postProjectUpdate} from '../../../partners/rest';

import {dateFormat} from '../../..';

import './Detail.scss';
import dayjs from "dayjs";

interface EditProps {
    editOff: () => void,
    projectId: string,
    triggerUpdate: () => void,
    warnMsg: string,
    errorMsg: string,
    deleteMsg: string,
    setWarnMsg: React.Dispatch<React.SetStateAction<string>>,
    setErrorMsg: React.Dispatch<React.SetStateAction<string>>,
    setDeleteMsg: React.Dispatch<React.SetStateAction<string>>,
}

function Edit(props: EditProps) {
    const navigate = useNavigate();

    const projectId = props.projectId;
    const warnMsg = props.warnMsg;
    const errorMsg = props.errorMsg;
    const deleteMsg = props.deleteMsg;
    const setWarnMsg = props.setWarnMsg;
    const setErrorMsg = props.setErrorMsg;
    const setDeleteMsg = props.setDeleteMsg;

    useEffect(() => {
        warnMsg && setTimeout(() => setWarnMsg(""), 4000)
    }, [warnMsg, setWarnMsg]);
    useEffect(() => {
        errorMsg && setTimeout(() => setErrorMsg(""), 4000)
    }, [errorMsg, setErrorMsg]);
    useEffect(() => {
        deleteMsg && setTimeout(() => setDeleteMsg(""), 4000)
    }, [deleteMsg, setDeleteMsg]);

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
            <div className='button' onClick={props.triggerUpdate}>Confirm</div>
            {warnMsg && <Fade>
                <div className='warning'>{warnMsg}</div>
            </Fade>}
            {errorMsg && <Fade>
                <div className='error'>{errorMsg}</div>
            </Fade>}
            <div className='button delete' onClick={triggerDelete}>Delete</div>
            {deleteMsg && <Fade>
                <div className='error'>{deleteMsg}</div>
            </Fade>}
        </>
    );
}

export function Detail() {
    const navigate = useNavigate();
    const {urlName} = useParams();
    const userId = useUserContext().user.id;

    const [projectId, setProjectId] = useState<string>('');
    const [projectSyntax, setProjectSyntax] = useState<string>('');
    const [projectName, setProjectName] = useState<string>('');
    const [projectCreation, setProjectCreation] = useState<string>('');
    const [projectUsers, setProjectUsers] = useState<Collab[]>([]);
    const [projectLastSpecs, setProjectLastSpecs] = useState<string>('');
    const [projectLatestProto, setProjectLatestProto] = useState<boolean>(false);
    const [projectDescription, setProjectDescription] = useState<string>('');

    const nullableDate = (date: string) => date ? dayjs(date).format(dateFormat) : <>-</>;

    const [edit, setEdit] = useState<boolean>(false);
    const editOn = () => setEdit(true);
    const editOff = () => setEdit(false);

    const [warnMsg, setWarnMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [deleteMsg, setDeleteMsg] = useState<string>("");

    useEffect(() => {
        postProjectExistForUser(userId, urlName || "")
            .then((data) => {
                setProjectId(data.project_id);

                postProjectGet(data.project_id)
                    .then((data) => {
                        setProjectName(data.result.name);
                        setProjectSyntax(data.result.syntax);
                        setProjectCreation(data.result.creation);
                        setProjectUsers(data.result.users);
                        setProjectLastSpecs(data.result.last_specs || '');
                        setProjectLatestProto(data.result.latest_proto);
                        setProjectDescription(data.result.description);
                    })
                    .catch(error => {
                        console.log("Error:", error);
                        setErrorMsg("Internal error");
                        console.log("Error:", error);
                    });
            })
            .catch(() => navigate('/projects'));
    }, [userId, urlName, navigate]);

    const [editName, setEditName] = useState<string>("");
    const [addCollabIds, setAddCollabIds] = useState<string[]>([]);
    const [removeCollabIds, setRemoveCollabIds] = useState<string[]>([]);
    const [editDescription, setEditDescription] = useState<string>('');
    const [deleteDescription, setDeleteDescription] = useState<boolean>(false);

    function triggerUpdate() {
        if (!(editName || addCollabIds.length || removeCollabIds.length || editDescription || deleteDescription)) {
            editOff();
            return;
        }
        if (editDescription && deleteDescription) {
            setWarnMsg("New description and delete description are incompatibles");
            return;
        }

        const projectNameEdit = editName.replaceAll('  ', ' ');
        console.log(projectNameEdit);

        postProjectUpdate(projectId, projectNameEdit, addCollabIds, removeCollabIds, editDescription, deleteDescription)
            .then((data) => {
                console.log(data);
                if (data.success === "already exist") {
                    setErrorMsg("Username already used");
                    return;
                }
                if (data.success) {
                    editOff();
                    if (projectNameEdit) navigate('/project/' + projectNameEdit);
                    else window.location.reload();
                } else setErrorMsg("Operation failure");
            })
            .catch(error => {
                setErrorMsg("Internal error");
                console.log("Error:", error);
            });
    }

    return (
        <section id="detail">
            <h1>Project Summary</h1>
            <div className='card large'>
                <h1>{projectName}</h1>
                {edit &&
                    <div className='input_group'>
                        <label>Change project name</label>
                        <input type='text'
                               onChange={(event) => setEditName(event.target.value)}
                               onKeyDown={(event) => (event.key === "Enter") && triggerUpdate()}
                        />
                    </div>
                }
                {(projectUsers.length > 1)
                    ? <Collabs usernames={projectUsers.filter(item => item.id !== userId).map(item => item.name)}/>
                    : !edit && <p>No collabs</p>
                }
                {edit &&
                    <>
                        <CollabsInput
                            label='Add collaborators'
                            initialCollabIds={projectUsers.map(item => item.id)}
                            currentCollabIds={addCollabIds}
                            setCurrentCollabIds={setAddCollabIds}
                            setErrorMsg={setErrorMsg}
                        />
                        {(projectUsers.length > 1) &&
                            <RemoveCollabsInput
                                label='Remove collaborators'
                                collabs={projectUsers.filter(item => item.id !== userId)}
                                currentCollabIds={removeCollabIds}
                                setCurrentCollabIds={setRemoveCollabIds}
                                setErrorMsg={setErrorMsg}
                            />
                        }
                    </>}
                <hr/>
                <h2>Summary</h2>
                <table>
                    <tbody>
                    <tr>
                        <th>Syntax selected</th>
                        <th>:</th>
                        <td>{projectSyntax}</td>
                    </tr>
                    <tr>
                        <th>Project creation date</th>
                        <th>:</th>
                        <td>{dayjs(projectCreation).format(dateFormat)}</td>
                    </tr>
                    <tr>
                        <th>Last specifications update</th>
                        <th>:</th>
                        <td>{nullableDate(projectLastSpecs)}</td>
                    </tr>
                    <tr>
                        <th>Prototype generation status</th>
                        <th>:</th>
                        <td>{projectLatestProto ? "Up to date" : "Outdated"}</td>
                    </tr>
                    </tbody>
                </table>
                <hr/>
                <h2>Description</h2>
                {edit && projectDescription &&
                    <div className='input_group'>
                        <label>
                            Delete description
                            <input
                                type='checkbox'
                                checked={deleteDescription}
                                onChange={() => setDeleteDescription(!deleteDescription)}
                            />
                        </label>
                    </div>}
                <p>{projectDescription || (edit ? '' : 'Describe your project gloal')}</p>
                {edit &&
                    <div className='input_group'>
                        <label>Change description</label>
                        <textarea
                            onChange={(event) => setEditDescription(event.target.value)}
                            onKeyDown={(event) => (event.key === "Enter") && triggerUpdate()}
                        />
                    </div>}
                {edit
                    ? <Edit
                        editOff={editOff}
                        projectId={projectId}
                        triggerUpdate={triggerUpdate}
                        warnMsg={warnMsg}
                        errorMsg={errorMsg}
                        deleteMsg={deleteMsg}
                        setWarnMsg={setWarnMsg}
                        setErrorMsg={setErrorMsg}
                        setDeleteMsg={setDeleteMsg}
                    />
                    : <div className='button' onClick={editOn}>Edit</div>
                }
            </div>
        </section>
    );
}
