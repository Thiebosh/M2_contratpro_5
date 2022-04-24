import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

import { useUserContext } from '../../../session/user';
import { CardPage } from '../../../components/CardPage';
import { CollabsInput } from '../../../components/Collabs';
import { postProjectCreate } from '../../../partners/rest';

import './CreateProject.scss';

export function CreateProject() {
    const navigate = useNavigate();
    const userId = useUserContext().user;

    const [name, setName] = useState<string>("");
    const [currentCollabIds, setCurrentCollabIds] = useState<string[]>([userId]);
    const [description, setDescription] = useState<string>("");
    const [warnMsg, setWarnMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => { warnMsg && setTimeout(() => setWarnMsg(""), 4000) }, [warnMsg]);
    useEffect(() => { errorMsg && setTimeout(() => setErrorMsg(""), 4000) }, [errorMsg]);

    function triggerCreate() {
        if (!name) {
            setWarnMsg("Empty mandatory field(s)");
            return;
        }

        postProjectCreate(name, currentCollabIds) // add description
        .then((data) => {
            console.log(data);
            if (data.success === "already exist") {
                setErrorMsg("Project name already used");
                return;
            }
            navigate('/project/'+name);
        })
        .catch(error => {
            setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }

    return (
        <section id="createproject">
            <h1>Create Project</h1>
            <CardPage size='large'>
                <div className='input_group'>
                    <label>Project name</label>
                    <input type='text' onChange={(event) => setName(event.target.value)}/>
                </div>
                <CollabsInput
                    currentCollabIds={currentCollabIds}
                    setCurrentCollabIds={setCurrentCollabIds}
                    setErrorMsg={setErrorMsg}
                />
                <div className='input_group'>
                    <label>Description</label>
                    <textarea onChange={(event) => setDescription(event.target.value)}/>
                </div>
                <div className='button' onClick={triggerCreate}>Create</div>
                { warnMsg && <Fade><div className='warning'>{warnMsg}</div></Fade> }
                { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
            </CardPage>
        </section>
    );
}
