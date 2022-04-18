import { createContext, useContext } from 'react';

const projectKey = "project";

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
