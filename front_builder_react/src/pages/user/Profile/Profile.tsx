import { useEffect, useState } from 'react';
import { getSessionUser } from '../../../session/user';
import { postAccountGet, postAccountUpdate } from '../../../partners/rest';

import './Profile.scss';

interface EditProps {
    id: string,
    editOff: () => void,
    setName: React.Dispatch<React.SetStateAction<string>>
};
function Edit(props:EditProps) {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordCheck, setPasswordCheck] = useState<string>("");
    const [warnMsg, setWarnMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => {
        if (warnMsg) {
            setTimeout(() => setWarnMsg(""), 4000);
        }
    }, [warnMsg]);
    useEffect(() => {
        if (errorMsg) {
            setTimeout(() => setErrorMsg(""), 4000);
        }
    }, [errorMsg]);

    function triggerUpdate() {
        if (!(name || password || passwordCheck)) {
            props.editOff();
            return;
        }

        if (!(name || (password && passwordCheck))) {
            setWarnMsg("Empty field(s)");
            return;
        }

        if (password !== passwordCheck) {
            setWarnMsg("Differents passwords");
            return;
        }

        postAccountUpdate(props.id, name, password)
        .then((data) => {
            if (data.success === "already exist") {
                setErrorMsg("Username already used");
                return;
            }
            props.setName(name);
            props.editOff();
        })
        .catch(error => {
            setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }

    return (
        <>
            <div className='input_group'>
                <label>Change your username</label>
                <br/>
                <input type='text' onChange={(event) => setName(event.target.value)}/>
            </div>
            <div className='input_group'>
                <label>Change your password</label>
                <br/>
                <input type='password'  onChange={(event) => setPassword(event.target.value)}/>
            </div>
            <div className='input_group'>
                <label>Password check</label>
                <br/>
                <input type='password'  onChange={(event) => setPasswordCheck(event.target.value)}/>
            </div>
            <div className='button' onClick={triggerUpdate}>Confirm</div>
            { warnMsg && <div className='warning'>{warnMsg}</div> }
            { errorMsg && <div className='error'>{errorMsg}</div> }
        </>
    );
}

export function Profile() {
    const id = getSessionUser() || "";
    const [name, setName] = useState<string>("");

    const [edit, setEdit] = useState<boolean>(false);

    const editOn = () => setEdit(true);
    const editOff = () => setEdit(false);

    useEffect(() => {
        postAccountGet(id)
        .then((data) => {
            setName(data.name);
        })
        .catch(error => {
            console.log("Error:", error);
        });
    }, [id]);

    return (
        <section id="profile">
            <div className='card'>
                <h1>User Profile</h1>
                <div className='summary'>
                    <img src='' alt='avatar'/>
                    <p>{name}</p>
                </div>
                { edit ? <Edit id={id} editOff={editOff} setName={setName}/> : <div className='button' onClick={editOn}>Edit</div>}
            </div>
        </section>
    );
}
