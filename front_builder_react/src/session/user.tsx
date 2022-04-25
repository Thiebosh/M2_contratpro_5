import { createContext, useContext } from 'react';
import moment from 'moment';
import {Navigate} from 'react-router-dom';

import {sessionDuration} from '../index';

const userKey = "user";

interface timedUser {
    userId:string,
    valid:string,
}

function refreshSetUser(userId:string) {
    const storage:timedUser = {
        userId: userId,
        valid: moment().add(sessionDuration, 'minutes').toISOString()
    };
    localStorage.setItem(userKey, JSON.stringify(storage));
}

function refreshGetUser() {
    const value = localStorage.getItem(userKey);
    if (!value) return null;

    const storage:timedUser = JSON.parse(value);
    if (moment().isAfter(storage.valid)) {
        localStorage.removeItem(userKey);
        return null;
    }

    refreshSetUser(storage.userId);
    return storage.userId;
}

export function requireNoUser(component:JSX.Element):JSX.Element {
    return (refreshGetUser() ? <Navigate to="/user/profile"/> : component);
}

export function requireUser(component:JSX.Element):JSX.Element {
    return (refreshGetUser() ? component : <Navigate to="/user/login"/>);
}

export function userContextMethods(triggerRefresh:React.Dispatch<React.SetStateAction<boolean>>) {
    return {
        user: refreshGetUser() || '',
        setUser: (userId: string) => {
            refreshSetUser(userId);
            triggerRefresh(true);
        },
        removeUser: () => {
            localStorage.removeItem(userKey);
            triggerRefresh(true);
        }
    };
}
export const userContext = createContext({
    user: '',
    setUser: (userId:string) => {},
    removeUser: () => {}
});
export const useUserContext = () => useContext(userContext);
