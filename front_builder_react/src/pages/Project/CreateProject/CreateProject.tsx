import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Fade} from 'react-awesome-reveal';

import {useUserContext} from '../../../session/user';
import {CollabsInput} from '../../../components/Collabs';
import {postProjectCreate, postSyntaxGetList} from '../../../partners/rest';

import './CreateProject.scss';

interface CreateProjectProps {
    setProjectName: React.Dispatch<React.SetStateAction<string>>,
}
export function CreateProject(props:CreateProjectProps) {
    const navigate = useNavigate();
    const userId = useUserContext().user.id;

    const [name, setName] = useState<string>("");
    const [currentCollabIds, setCurrentCollabIds] = useState<string[]>([userId]);
    const [syntaxList, setSyntaxList] = useState<{ id: string, name: string, description: string }[]>([]);
    const [syntaxId, setSyntaxId] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [warnMsg, setWarnMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => {
        postSyntaxGetList()
            .then((data) => {
                setSyntaxId(data.result[0].id);
                setSyntaxList(data.result);
            })
            .catch(error => {
                setErrorMsg("Internal error");
                console.log("Error:", error);
            });
    }, []);

    useEffect(() => {
        warnMsg && setTimeout(() => setWarnMsg(""), 4000)
    }, [warnMsg]);
    useEffect(() => {
        errorMsg && setTimeout(() => setErrorMsg(""), 4000)
    }, [errorMsg]);

    function triggerCreate() {
        if (!(name && syntaxId)) {
            setWarnMsg("Empty mandatory field(s)");
            return;
        }

        name.trim();

        postProjectCreate(name, currentCollabIds, syntaxId, description)
            .then((data) => {
                if (data.success === "already exist") {
                    setErrorMsg("Project name already used");
                    return;
                }
                props.setProjectName(name);
                navigate('/project/' + name);
            })
            .catch(error => {
                setErrorMsg("Internal error");
                console.log("Error:", error);
            });
    }

    return (
        <section id="createproject">
            <h1>Create Project</h1>
            <div className='card large'>
                <div className='input_group'>
                    <label>Project name</label>
                    <input type='text'
                           onChange={(event) => setName(event.target.value)}
                           onKeyDown={(event) => (event.key === "Enter") && triggerCreate()}
                    />
                </div>
                <CollabsInput
                    label='Choose collaborators'
                    currentCollabIds={currentCollabIds}
                    setCurrentCollabIds={setCurrentCollabIds}
                    setErrorMsg={setErrorMsg}
                />
                <div className='input_group'>
                    <label>Project syntax</label>
                    <div className='syntaxes'>
                        {syntaxList.map((item) => (
                            <div
                                key={item.id}
                                className={"syntax " + (syntaxId === item.id && "current")}
                                onClick={() => setSyntaxId(item.id)}>
                                <h3>{item.name}</h3>
                                <hr/>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='input_group'>
                    <label>Description</label>
                    <textarea
                        onChange={(event) => setDescription(event.target.value)}
                        onKeyDown={(event) => (event.key === "Enter") && triggerCreate()}
                    />
                </div>
                <div className='button' onClick={triggerCreate}>Create</div>
                {warnMsg && <Fade>
                    <div className='warning'>{warnMsg}</div>
                </Fade>}
                {errorMsg && <Fade>
                    <div className='error'>{errorMsg}</div>
                </Fade>}
            </div>
        </section>
    );
}
