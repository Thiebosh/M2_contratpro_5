import { createContext, useContext } from 'react';
import {
    Navigate
} from 'react-router-dom';

const projectKey = "project";

export function requireProject(component:JSX.Element):JSX.Element {
    return (sessionStorage.getItem(projectKey) ? component : <Navigate to="/projects"/> );
}

export function projectContextMethods(triggerRefresh:React.Dispatch<React.SetStateAction<boolean>>) {
    return {
        project: sessionStorage.getItem(projectKey) || '',
        setProject: (projectId: string) => {
            sessionStorage.setItem(projectKey, projectId);
            triggerRefresh(true);
        },
        removeProject: () => {
            sessionStorage.setItem(projectKey, '');
            triggerRefresh(true);
        }
    };
}
export const projectContext = createContext({
    project: '',
    setProject: (projectId:string) => {},
    removeProject: () => {}
});
export const useProjectContext = () => useContext(projectContext);
