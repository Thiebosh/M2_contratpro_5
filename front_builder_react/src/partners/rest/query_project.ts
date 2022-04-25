import {_postRequest} from './core';

interface ProjectCreate {
    success: string|boolean
}
export async function postProjectCreate(name:string, users_id:string[], description:string): Promise<ProjectCreate> {
    const data = {
        name: name,
        users_id: JSON.stringify(users_id),
        // description: description, //TODO
    }
    return await _postRequest('/project/create', data);
}

interface ProjectGet {
    result: {
        name:string,
        users: {
            id: string,
            name: string
        }[]
        creation:string,
        last_specs:string|null,
        last_proto:string|null
    }
}
export async function postProjectGet(id:string): Promise<ProjectGet> {
    const data = {
        id: id
    }
    return await _postRequest('/project/get', data);
}

interface ProjectUpdate {
    success: string|boolean
}
export async function postProjectUpdate(id:string, name:string): Promise<ProjectUpdate> {
    const data = {
        id: id,
        name: name
    }
    return await _postRequest('/project/update', data);
}

interface ProjectExistForUser {
    id: string|false
}
export async function postProjectExistForUser(user_id:string, project_name:string): Promise<ProjectExistForUser> {
    const data = {
        user_id: user_id,
        project_name: project_name
    }
    return await _postRequest('/project/exist_for_user', data);
}

interface ProjectSearchByUser {
    result: {//peut simplifier car un seul projet... recherche par id
        id: string,
        name: string,
        users: {
            id: string,
            name: string
        }[],
        creation: string,
        last_specs: string,
        last_proto: string
    }[]
}
export async function postProjectSearchForUser(user_id:string): Promise<ProjectSearchByUser> {
    const data = {
        user_id: user_id
    }
    return await _postRequest('/project/search_for_user', data);
}

interface ProjectAddUser {
    success: boolean
}
export async function postProjectAddUser(id:string, user_id:string): Promise<ProjectAddUser> {
    const data = {
        id: id,
        user_id: user_id
    }
    return await _postRequest('/project/add_user', data);
}

interface ProjectRemoveUser {
    success: boolean
}
export async function postProjectRemoveUser(id:string, user_id:string): Promise<ProjectRemoveUser> {
    const data = {
        id: id,
        user_id: user_id
    }
    return await _postRequest('/project/remove_user', data);
}

interface ProjectDelete {
    success: boolean
}
export async function postProjectDelete(id:string): Promise<ProjectDelete> {
    const data = {
        id: id
    }
    return await _postRequest('/project/delete', data);
}
