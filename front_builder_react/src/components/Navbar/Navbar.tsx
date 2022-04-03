import Link from '@mui/material/Link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'

import './Navbar.scss';

function User() {
    return (
        <FontAwesomeIcon className="user" icon={faCircleUser}/>
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
