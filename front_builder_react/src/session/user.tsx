import { createContext, useContext } from 'react';
import {
    Navigate
} from 'react-router-dom';

const userKey = "user";

export function requireUser(component:JSX.Element):JSX.Element {
    return (localStorage.getItem(userKey) ? component : <Navigate to="/user/login"/>);
}

export function userContextMethods(triggerRefresh:React.Dispatch<React.SetStateAction<boolean>>) {
    return {
        user: localStorage.getItem(userKey) || '',
        setUser: (userId: string) => {
            localStorage.setItem(userKey, userId);
            triggerRefresh(true);
        },
        removeUser: () => {
            localStorage.setItem(userKey, '');
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
