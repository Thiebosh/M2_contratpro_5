import { useEffect, useState } from 'react';
import { createBrowserHistory } from 'history';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

import { useUserContext } from '../../session/user';

import './NavBar.scss';

function Card() {
    const userContext = useUserContext();

    return (
        <div className='card'>
            {
                userContext.user.id ?
                    <>
                        <h3>{userContext.user.name}</h3>
                        <hr/>
                        <a href='/user/profile'>Account</a>
                        <hr/>
                        <a href='/' onClick={userContext.removeUser}>Logout</a>
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

interface LinkProps {
    currentPath?: string,
    path: string,
    text: string
}
function Link(props:LinkProps) {
    return (
        <a href={props.path} className={props.currentPath === props.path ? "title current" : "title"}>
            <div>
                {props.text}
            </div>
        </a>
    );
}

interface NavBarProps {
    projectName: string,
    setProjectName: React.Dispatch<React.SetStateAction<string>>,
}
export function NavBar(props:NavBarProps) {
    const currentPath:string = createBrowserHistory().location.pathname;

    const projectName = props.projectName;
    const setProjectName = props.setProjectName;

    useEffect(() => {
        if (currentPath.startsWith('/project/')) {
            const split = currentPath.split('/');
            if (split.length > 2) {
                setProjectName(split[2]);
            }
        }
    }, [])

    return (
    <nav id='navbar'>
        <div className='left-part'>
            <Link path={'/home'} text={'<SpecTry/>'}/>
            <Link currentPath={currentPath} path={'/projects'} text={'Projects'}/>
            {
                projectName && (
                <>
                    <Link currentPath={currentPath} path={'/project/'+projectName} text='Project'/>
                    <Link currentPath={currentPath} path={'/project/'+projectName+'/specs'} text='Specifications'/>
                    <Link currentPath={currentPath} path={'/project/'+projectName+'/proto'} text='Prototype'/>
                </>)
            }
        </div>
        <User/>
    </nav>
    );
}
