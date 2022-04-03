import {setSessionUser} from '../../../session/user';
import './Login.scss';

export default function Login() {
    return (
        <div id="login">
            Login page
            <a href="/user/profile"><button onClick={() => setSessionUser("some")}>valider</button></a>
            <a href="/user/create"><button>créer compte</button></a>
        </div>
    );
}
