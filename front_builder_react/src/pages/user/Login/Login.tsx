import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

import { CardPage } from '../../../components/CardPage';
import { useUserContext } from '../../../session/user';
import { postAccountConnect } from '../../../partners/rest';

import './Login.scss';

export function Login() {
    const navigate = useNavigate();
    const userContext = useUserContext();

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
            userContext.setUser(data.id);
            navigate('/projects');
        })
        .catch(error => {
            setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }

    return (
        <section id='login'>
            <h1>Login</h1>
            <CardPage size='small'>
                <div className='input_group'>
                    <label>Username</label>
                    <input type='text'
                        onChange={(event) => setName(event.target.value)}
                        onKeyDown={(event) => (event.key === "Enter") && triggerLogin()}
                    />
                </div>
                <div className='input_group'>
                    <label>Password</label>
                    <input type='password'
                        onChange={(event) => setPassword(event.target.value)}
                        onKeyDown={(event) => (event.key === "Enter") && triggerLogin()}
                    />
                </div>
                <div className='button' onClick={triggerLogin}>Sign in</div>
                { warnMsg && <Fade><div className='warning'>{warnMsg}</div></Fade> }
                { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
            </CardPage>
        </section>
    );
}
