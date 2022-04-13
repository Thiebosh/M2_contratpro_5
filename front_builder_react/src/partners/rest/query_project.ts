import {_postRequest} from './core';

interface ProjectCreate {
    success: string|boolean
}
export async function postProjectCreate(name:string, users_id:string[]): Promise<ProjectCreate> {
    const data = {
        name: name,
        users_id: users_id
    }
    return await _postRequest('/project/create', data);
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

interface ProjectSearch {
    result: {//peut simplifier car un seul projet... recherche par id
        name: string,
        users: {
            id: string,
            name: string
        }[]
    }[]
}
export async function postProjectSearch(id:string): Promise<ProjectSearch> {
    const data = {
        id: id
    }
    return await _postRequest('/project/search', data);
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
export async function postProjectSearchByUser(user_id:string): Promise<ProjectSearchByUser> {
    const data = {
        user_id: user_id
    }
    return await _postRequest('/project/search_by_user', data);
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
