import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { getSessionUser, removeSessionUser } from '../../session/user';

import './NavBar.scss';

function Card() {
    return (
        <div className='card'>
            {
                getSessionUser() ? 
                    <>
                        <a href='/user/profile'>Account</a>
                        <a href='/user/settings'>Settings</a>
                        <hr/>
                        <a href='/' onClick={removeSessionUser}>Logout</a>
                    </>
                    :
                    <>
                        <a href='/user/login'>Log in</a>
                        <a href='/user/create'>Sign in</a>
                    </>
            }
        </div>
    );
}

function User() {
    const [displayMenu, setDisplayMenu] = useState<boolean>(false);
    return (
        <div className='user' onClick={() => setDisplayMenu(!displayMenu)}>
            <FontAwesomeIcon icon={faCircleUser}/>
            { displayMenu && <Card/> }
        </div>
    );
}

export default function NavBar() {
    return (
    <nav id='navbar'>
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
