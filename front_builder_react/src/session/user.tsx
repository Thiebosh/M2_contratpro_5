import {
    Navigate
} from 'react-router-dom';

const userKey = "user";

export function getSessionUser() {
    return sessionStorage.getItem(userKey);
}

export function setSessionUser(user: string) {
    sessionStorage.setItem(userKey, user);
}

export function removeSessionUser() {
    sessionStorage.setItem(userKey, "");
}

export function requireLoggedUser(component:JSX.Element) {
    return (sessionStorage.getItem(userKey) ? component : <Navigate to="/user/login"/> );
}
