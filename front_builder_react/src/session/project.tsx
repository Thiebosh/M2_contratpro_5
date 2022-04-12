import {
    Navigate
} from 'react-router-dom';

const projectKey = "project";

export function getSessionProject() {
    return sessionStorage.getItem(projectKey);
}

export function setSessionProject(project: string) {
    sessionStorage.setItem(projectKey, project);
}

export function removeSessionProject() {
    sessionStorage.setItem(projectKey, "");
}

export function requireProject(component:JSX.Element) {
    return (sessionStorage.getItem(projectKey) ? component : <Navigate to="/user/login"/> );//project set ?
}
