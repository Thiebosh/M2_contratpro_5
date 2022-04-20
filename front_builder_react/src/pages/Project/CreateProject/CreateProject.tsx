import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

import { CardPage } from '../../../components/CardPage';
import { postProjectCreate } from '../../../partners/rest';

import './CreateProject.scss';

interface Collab {
    id:string,
    name:string
}
export function CreateProject() {
    const navigate = useNavigate();
    const [name, setName] = useState<string>("");
    const [collabs, setCollabs] = useState<Collab[]>([]);
    const [description, setDescription] = useState<string>("");
    const [warnMsg, setWarnMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => { warnMsg && setTimeout(() => setWarnMsg(""), 4000) }, [warnMsg]);
    useEffect(() => { errorMsg && setTimeout(() => setErrorMsg(""), 4000) }, [errorMsg]);

    function addCollab(collab:string) {
        if (!collab) return;
        setCollabs([...collabs, JSON.parse(collab)]);
    }

    function triggerCreate() {
        if (!name) {
            setWarnMsg("Empty mandatory field(s)");
            return;
        }

        console.log(description);
        postProjectCreate(name, collabs.map(item => item.id)) // add description
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
                <div className='input_group'>
                    <label>Choose collaborators</label>
                    <div className='collabs'>
                        {collabs.map(item => (
                            <div className='bubble' key={item.name}>
                                {item.name[0]}
                                <span>{item.name}</span>
                            </div>
                        ))}
                    </div>
                    <input type="text" list="exampleList" onChange={(event) => addCollab(event.target.value)}/>
                    <datalist id="exampleList">
                        <option value={JSON.stringify({id:"id", name:"name"})}/>
                    </datalist>
                </div>
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
