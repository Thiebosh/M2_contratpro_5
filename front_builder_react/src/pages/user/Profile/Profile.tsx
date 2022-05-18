import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Fade} from 'react-awesome-reveal';

import {useUserContext} from '../../../session/user';
import {postAccountGet, postAccountUpdate, postAccountDelete} from '../../../partners/rest';

import './Profile.scss';

interface EditProps {
    editOff: () => void,
    setName: React.Dispatch<React.SetStateAction<string>>
};

function Edit(props: EditProps) {
    const navigate = useNavigate();
    const userContext = useUserContext();

    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordCheck, setPasswordCheck] = useState<string>("");
    const [warnMsg, setWarnMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [deleteMsg, setDeleteMsg] = useState<string>("");

    useEffect(() => {
        warnMsg && setTimeout(() => setWarnMsg(""), 4000)
    }, [warnMsg]);
    useEffect(() => {
        errorMsg && setTimeout(() => setErrorMsg(""), 4000)
    }, [errorMsg]);
    useEffect(() => {
        deleteMsg && setTimeout(() => setDeleteMsg(""), 4000)
    }, [deleteMsg]);

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

        const userName = name.replaceAll(/\s\s+/g, ' ');
        console.log(userName);

        postAccountUpdate(userContext.user.id, userName, password)
            .then((data) => {
                if (data.success === "already exist") {
                    setErrorMsg("Username already used");
                    return;
                }
                props.setName(userName);
                props.editOff();
            })
            .catch(error => {
                setErrorMsg("Internal error");
                console.log("Error:", error);
            });
    }

    function triggerDelete() {
        postAccountDelete(userContext.user.id)
            .then((data) => {
                if (!data.success) {
                    setDeleteMsg("Something wrong appened");
                    return;
                }
                userContext.removeUser();
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
                <input type='text'
                       onChange={(event) => setName(event.target.value)}
                       onKeyDown={(event) => (event.key === "Enter") && triggerUpdate()}
                />
            </div>
            <div className='input_group'>
                <label>Change your password</label>
                <input type='password'
                       onChange={(event) => setPassword(event.target.value)}
                       onKeyDown={(event) => (event.key === "Enter") && triggerUpdate()}
                />
            </div>
            <div className='input_group'>
                <label>Password check</label>
                <input type='password'
                       onChange={(event) => setPasswordCheck(event.target.value)}
                       onKeyDown={(event) => (event.key === "Enter") && triggerUpdate()}
                />
            </div>
            <div className='button' onClick={triggerUpdate}>Confirm</div>
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

export function Profile() {
    const userContext = useUserContext();

    const [name, setName] = useState<string>("");
    const [nbProjects, setNbProjects] = useState<number>(0);
    const [edit, setEdit] = useState<boolean>(false);

    const editOn = () => setEdit(true);
    const editOff = () => setEdit(false);

    useEffect(() => {
        postAccountGet(userContext.user.id)
            .then((data) => {
                setName(data.name);
                setNbProjects(data.nbProjects);
            })
            .catch(error => {
                console.log("Error:", error);
            });
    }, [userContext.user.id]);

    return (
        <section id='profile'>
            <h1>User Profile</h1>
            <div className='card medium'>
                <div className='summary'>
                    <img src='/img/avatar.jpg' alt='avatar'/>
                    <div>
                        <h1>{name}</h1>
                        <p>{nbProjects} project{nbProjects > 1 && "s"}</p>
                    </div>
                </div>
                {edit ? <Edit editOff={editOff} setName={setName}/> :
                    <div className='button' onClick={editOn}>Edit</div>}
            </div>
        </section>
    );
}
