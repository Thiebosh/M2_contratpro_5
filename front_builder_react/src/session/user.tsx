import {
    Navigate
} from 'react-router-dom';

const userKey = "user";

export function getSessionUser():string|null {
    return sessionStorage.getItem(userKey);
}

export function setSessionUser(user:string):void {
    sessionStorage.setItem(userKey, user);
}

export function removeSessionUser():void {
    sessionStorage.setItem(userKey, "");
}

export function requireUser(component:JSX.Element):JSX.Element {
    return (sessionStorage.getItem(userKey) ? component : <Navigate to="/user/login"/> );
}
