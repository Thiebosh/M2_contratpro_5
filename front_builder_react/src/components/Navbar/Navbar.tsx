import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { removeSessionUser } from '../../session/user';

import './Navbar.scss';

function User() {
    return (
        <div>
            <FontAwesomeIcon className="user" icon={faCircleUser}/>
            <a href="/user/login"><button>connexion</button></a>
            <a href="/"><button onClick={removeSessionUser}>déconnexion</button></a>
        </div>
    );
}

export default function NavBar() {
    return (
    <nav id="navbar">
        <div className='left-part'>
            <a href='/home' className="title">
                <div>
                    &#60;SpecTry/&#62;
                </div>
            </a>
            <a href='/user/projects' className="title">
                <div>
                    Projets
                </div>
            </a>
        </div>
        <User/>
    </nav>
    );
}
