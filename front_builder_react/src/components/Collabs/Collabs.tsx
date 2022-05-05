import { useState } from 'react';

import { useUserContext } from '../../session/user';
import { postAccountSearch } from '../../partners/rest';

import './Collabs.scss';

export interface Collab {
    id:string,
    name:string,
}

interface CollabsProps {
    usernames: string[],
    className?: 'delete',
    onClick?: (item:string) => void,
}
export function Collabs(props: CollabsProps) {
    return (
        <div className='collabs'>
            {props.usernames.map(item => (
                <div className={'bubble '+props.className} key={item} onClick={() => props.onClick && props.onClick(item)}>
                    {item[0]}
                    <span>{item}</span>
                </div>
            ))}
        </div>
    );
}

interface CollabsInputProps {
    label:string,
    initialCollabIds?: string[],
    currentCollabIds: string[],
    setCurrentCollabIds: React.Dispatch<React.SetStateAction<string[]>>,
    setErrorMsg: React.Dispatch<React.SetStateAction<string>>
}
export function CollabsInput(props:CollabsInputProps):JSX.Element {
    const userId = useUserContext().user.id;

    const initialCollabIds = props.initialCollabIds;
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
        postAccountSearch(collab, 6, [userId, ...currentCollabIds, ...(initialCollabIds || [])])
        .then((data) => {
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
            <label>{props.label}</label>
            <Collabs usernames={currentCollabNames} onClick={(item:string) => removeCollab(item)}/>
            <input type="text" list="potentialCollabList"
                value={inputValue}
                onChange={(event) => onChangeInputDataList(event.nativeEvent, event.target.value)}
                onKeyDown={(event) => onKeyDownInputDataList(event.key, event.currentTarget.value, event.nativeEvent)}
            />
            <datalist id="potentialCollabList">
                {searchCollabNames.map(item => (<option key={item} value={item}/>))}
            </datalist>
        </div>
    );
}

interface RemoveCollabsInputProps {
    label:string,
    collabs:Collab[],
    currentCollabIds: string[],
    setCurrentCollabIds: React.Dispatch<React.SetStateAction<string[]>>,
    setErrorMsg: React.Dispatch<React.SetStateAction<string>>
}
export function RemoveCollabsInput(props:RemoveCollabsInputProps):JSX.Element {
    const collabs = props.collabs;
    const currentCollabIds = props.currentCollabIds;
    const setCurrentCollabIds = props.setCurrentCollabIds;
    const setErrorMsg = props.setErrorMsg;

    const [inputValue, setInputValue] = useState<string>("");
    const [currentCollabNames, setCurrentCollabNames] = useState<string[]>([]);

    const onChangeInputDataList = (nativeEvent:Event, text:string) => nativeEvent instanceof InputEvent ? setInputValue(text) : addCollab(text);
    const onKeyDownInputDataList = (key:string, value:string, nativeEvent:KeyboardEvent) => {
        if (!(nativeEvent instanceof KeyboardEvent)) setInputValue(''); //cas particulier : clic sur option == input
        (key === "Enter") && addCollab(value);
    }

    function addCollab(collab:string) {
        if (currentCollabNames.includes(collab)) return;

        const collabId = collabs.find(item => item.name === collab)?.id;
        if (!collabId) return;

        setCurrentCollabNames([...currentCollabNames, collab]);
        setCurrentCollabIds([...currentCollabIds, collabId]);
    }

    function removeCollab(collab:string) {
        const collabId = collabs.find(item => item.name === collab)?.id;
        if (!collabId) {
            setErrorMsg("Internal error");
            return;
        }

        setCurrentCollabNames([...currentCollabNames.filter(item => item !== collab)]);
        setCurrentCollabIds([...currentCollabIds.filter(item => item !== collabId)]);
    }

    return (
        <div className='input_group'>
            <label>{props.label}</label>
            <Collabs className='delete' usernames={currentCollabNames} onClick={(item:string) => removeCollab(item)}/>
            <input type="text" list="currentCollabList"
                value={inputValue}
                onChange={(event) => onChangeInputDataList(event.nativeEvent, event.target.value)}
                onKeyDown={(event) => onKeyDownInputDataList(event.key, event.currentTarget.value, event.nativeEvent)}
            />
            <datalist id="currentCollabList">
                {collabs.filter(item => !currentCollabNames.includes(item.name)).map(item => (<option key={item.name} value={item.name}/>))}
            </datalist>
        </div>
    );
}
