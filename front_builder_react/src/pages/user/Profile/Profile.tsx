import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionUser, removeSessionUser } from '../../../session/user';
import { postAccountGet, postAccountUpdate, postAccountDelete } from '../../../partners/rest';

import './Profile.scss';

interface EditProps {
    id: string,
    editOff: () => void,
    setName: React.Dispatch<React.SetStateAction<string>>
};
function Edit(props:EditProps) {
    const navigate = useNavigate();
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordCheck, setPasswordCheck] = useState<string>("");
    const [warnMsg, setWarnMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [deleteMsg, setDeleteMsg] = useState<string>("");

    useEffect(() => { warnMsg && setTimeout(() => setWarnMsg(""), 4000) }, [warnMsg]);
    useEffect(() => { errorMsg && setTimeout(() => setErrorMsg(""), 4000) }, [errorMsg]);
    useEffect(() => { deleteMsg && setTimeout(() => setDeleteMsg(""), 4000) }, [deleteMsg]);

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

    function triggerDelete() {
        // hover confirm button ?
        postAccountDelete(props.id)
        .then((data) => {
            if (!data.success) {
                setDeleteMsg("Something wrong appened");
                return;
            }
            removeSessionUser(); // naviguer direct sur /user/logout et généraliser le comportement
            navigate('/home');
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
                <input type='text' onChange={(event) => setName(event.target.value)}/>
            </div>
            <div className='input_group'>
                <label>Change your password</label>
                <input type='password'  onChange={(event) => setPassword(event.target.value)}/>
            </div>
            <div className='input_group'>
                <label>Password check</label>
                <input type='password'  onChange={(event) => setPasswordCheck(event.target.value)}/>
            </div>
            <div className='button' onClick={triggerUpdate}>Confirm</div>
            { warnMsg && <div className='warning'>{warnMsg}</div> }
            { errorMsg && <div className='error'>{errorMsg}</div> }
            <div className='button delete' onClick={triggerDelete}>Delete</div>
            { deleteMsg && <div className='error'>{deleteMsg}</div> }
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
