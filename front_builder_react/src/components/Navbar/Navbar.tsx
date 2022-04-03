import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import {setSessionUser, removeSessionUser} from '../../session/user'

import './Navbar.scss';

function User() {

    return (
        <div>
            <FontAwesomeIcon className="user" icon={faCircleUser}/>
            <a href="/user/projects"><button onClick={() => setSessionUser("some")}>co</button></a>
            <a href="/"><button onClick={removeSessionUser}>déco</button></a>
        </div>
    );
}

export default function NavBar() {
    return (
    <nav id="navbar">
        <a href='/home' className="title">
            <div>
                &#60;SpecTry/&#62;
            </div>
        </a>
        <User/>
    </nav>
    );
}
