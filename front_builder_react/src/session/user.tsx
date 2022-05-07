import { createContext, useContext } from 'react';
import moment from 'moment';
import {Navigate} from 'react-router-dom';

import {sessionDuration} from '../index';

const userKey = "user";

interface timedUser {
    userId:string,
    userName:string,
    valid:string,
}

function refreshSetUser(userId:string, userName:string) {
    const storage:timedUser = {
        userId: userId,
        userName: userName,
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

    refreshSetUser(storage.userId, storage.userName);
    return { 
        id: storage.userId,
        name: storage.userName,
    };
}

export function requireNoUser(component:JSX.Element):JSX.Element {
    return (refreshGetUser()?.id ? <Navigate to="/user/profile"/> : component);
}

export function requireUser(component:JSX.Element):JSX.Element {
    return (refreshGetUser()?.id ? component : <Navigate to="/user/login"/>);
}

export function userContextMethods(triggerRefresh:React.Dispatch<React.SetStateAction<boolean>>) {
    return {
        user: refreshGetUser() || {
            id: '',
            name: ''
        },
        setUser: (userId: string, userName: string) => {
            refreshSetUser(userId, userName);
            triggerRefresh(true);
        },
        removeUser: () => {
            localStorage.removeItem(userKey);
            triggerRefresh(true);
        }
    };
}
const userContext = createContext({
    user: {
        id: '',
        name: ''
    },
    setUser: (userId:string, userName:string) => {},
    removeUser: () => {}
});
export const UserProvider = userContext.Provider;
export const useUserContext = () => useContext(userContext);
