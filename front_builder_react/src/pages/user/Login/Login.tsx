import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

import { postAccountConnect } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

import './Login.scss';

function Card() {
    const navigate = useNavigate();
    const UserContext = useUserContext();

    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
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

    function triggerLogin() {
        if (!(name && password)) {
            setWarnMsg("Empty field(s)");
            return;
        }

        postAccountConnect(name, password)
        .then((data) => {
            if (typeof data.id == "boolean") {
                setErrorMsg("Credentials invalid");
                return;
            }
            UserContext.setUser(data.id);
            navigate('/projects');
        })
        .catch(error => {
            setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }

    return (
        <div className='card'>
            <div className='input_group'>
                <label>Username</label>
                <input type='text' onChange={(event) => setName(event.target.value)}/>
            </div>
            <div className='input_group'>
                <label>Password</label>
                <input type='password' onChange={(event) => setPassword(event.target.value)}/>
            </div>
            <div className='button' onClick={triggerLogin}>Sign in</div>
            { warnMsg && <Fade><div className='warning'>{warnMsg}</div></Fade> }
            { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
        </div>
    );
}

export function Login() {
    return (
        <section id="login">
            <h1>Login</h1>
            <Card/>
        </section>
    );
}
