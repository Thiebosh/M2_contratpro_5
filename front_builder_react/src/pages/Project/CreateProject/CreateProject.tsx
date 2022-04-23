import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

import { useUserContext } from '../../../session/user';
import { CardPage } from '../../../components/CardPage';
import { postProjectCreate, postAccountSearch } from '../../../partners/rest';

import './CreateProject.scss';

interface CollabsInputProps {
    currentCollabIds: string[],
    setCurrentCollabIds: React.Dispatch<React.SetStateAction<string[]>>,
    setErrorMsg: React.Dispatch<React.SetStateAction<string>>
}
function CollabsInput(props:CollabsInputProps):JSX.Element {
    const userId = useUserContext().user;

    const currentCollabIds = props.currentCollabIds;
    const setCurrentCollabIds = props.setCurrentCollabIds;
    const setErrorMsg = props.setErrorMsg;

    const [inputValue, setInputValue] = useState<string>("");
    const [currentCollabNames, setCurrentCollabNames] = useState<string[]>([]);
    const [currentCollabMapNameToId, setCurrentCollabMapNameToId] = useState<Map<string, string>>(new Map());
    const [searchCollabNames, setSearchCollabNames] = useState<string[]>([]);
    const [searchCollabMapNameToId, setSearchCollabMapNameToId] = useState<Map<string, string>>(new Map());

    const onChangeInputDataList = (nativeEvent:Event, text:string) => nativeEvent instanceof InputEvent ? searchCollab(text) : addCollab(text);
    const onKeyDownInputDataList = (key:string, value:string, nativeEvent:KeyboardEvent) => {
        if (!(nativeEvent instanceof KeyboardEvent)) setInputValue(''); //cas particulier : clic sur option == input
        (key === "Enter") && addCollab(value);
    }

    function searchCollab(collab:string) {
        setInputValue(collab);
        setSearchCollabMapNameToId(new Map());

        if (!collab) return;
        postAccountSearch(collab, 6, userId)
        .then((data) => {
            data.result = data.result.filter(item => !currentCollabNames.includes(item.name));
            setSearchCollabNames(data.result.map(item => item.name));
            setSearchCollabMapNameToId(data.result.reduce((accu, item) => accu.set(item.name, item.id), new Map<string, string>()));
        })
        .catch(error => {
            setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }

    function addCollab(collab:string) {
        if (currentCollabNames.includes(collab)) return;

        const collabId = searchCollabMapNameToId.get(collab);
        if (!collabId) return;

        setCurrentCollabNames([...currentCollabNames, collab]);
        setCurrentCollabIds([...currentCollabIds, collabId]);
        setCurrentCollabMapNameToId(currentCollabMapNameToId.set(collab, collabId));

        setSearchCollabNames([...searchCollabNames.filter(item => item !== collab)]);
    }

    function removeCollab(collab:string) {
        const collabId = currentCollabMapNameToId.get(collab);
        if (!collabId) {
            setErrorMsg("Internal error");
            return;
        }

        setCurrentCollabNames([...currentCollabNames.filter(item => item !== collab)]);
        setCurrentCollabIds([...currentCollabIds.filter(item => item !== collabId)]);
    }

    return (
        <div className='input_group'>
            <label>Choose collaborators</label>
            <div className='collabs'>
                {currentCollabNames.map(item => (
                    <div className='bubble' key={item} onClick={() => removeCollab(item)}>
                        {item[0]}
                        <span>{item}</span>
                    </div>
                ))}
            </div>
            <input type="text" list="exampleList"
                value={inputValue}
                onChange={(event) => onChangeInputDataList(event.nativeEvent, event.target.value)}
                onKeyDown={(event) => onKeyDownInputDataList(event.key, event.currentTarget.value, event.nativeEvent)}
            />
            <datalist id="exampleList">
                {searchCollabNames.map(item => (<option key={item} value={item}/>))}
            </datalist>
        </div>
    );
}

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
