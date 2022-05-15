import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

import { postAccountCreate } from '../../../partners/rest';

import './CreateUser.scss';

export function CreateUser() {
    const navigate = useNavigate();
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordCheck, setPasswordCheck] = useState<string>("");
    const [warnMsg, setWarnMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => { warnMsg && setTimeout(() => setWarnMsg(""), 4000) }, [warnMsg]);
    useEffect(() => { errorMsg && setTimeout(() => setErrorMsg(""), 4000) }, [errorMsg]);

    function triggerCreate() {
        if (!(name && password && passwordCheck)) {
            setWarnMsg("Empty field(s)");
            return;
        }

        if (password !== passwordCheck) {
            setWarnMsg("Differents passwords");
            return;
        }

        postAccountCreate(name, password)
        .then((data) => {
            if (data.success === "already exist") {
                setErrorMsg("Username already used");
                return;
            }
            navigate('/user/login');
        })
        .catch(error => {
            setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }

    return (
        <section id='create'>
            <h1>Create Account</h1>
            <div className='card small'>
                <div className='input_group'>
                    <label>Username</label>
                    <input type='text'
                        onChange={(event) => setName(event.target.value)}
                        onKeyDown={(event) => (event.key === "Enter") && triggerCreate()}
                    />
                </div>
                <div className='input_group'>
                    <label>Password</label>
                    <input type='password'
                        onChange={(event) => setPassword(event.target.value)}
                        onKeyDown={(event) => (event.key === "Enter") && triggerCreate()}
                    />
                </div>
                <div className='input_group'>
                    <label>Password check</label>
                    <input type='password'
                        onChange={(event) => setPasswordCheck(event.target.value)}
                        onKeyDown={(event) => (event.key === "Enter") && triggerCreate()}
                    />
                </div>
                <div className='button' onClick={triggerCreate}>Create</div>
                { warnMsg && <Fade><div className='warning'>{warnMsg}</div></Fade> }
                { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
                <br/>
                <a href="/user/login"><div className='button'>Log in</div></a>
            </div>
        </section>
    );
}
