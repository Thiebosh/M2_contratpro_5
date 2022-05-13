import {_postRequest} from './core';

interface AccountCreate {
    success:string|boolean
}
export async function postAccountCreate(name:string, password:string): Promise<AccountCreate> {
    const data = {
        name: name,
        password: password,
    }
    return await _postRequest('/account/create', data);
}

interface AccountConnect {
    id:string|boolean
}
export async function postAccountConnect(name:string, password:string): Promise<AccountConnect> {
    const data = {
        name: name,
        password: password,
    }
    return await _postRequest('/account/connect', data);
}

interface AccountGet {
    name:string,
    nbProjects:number,
}
export async function postAccountGet(id:string): Promise<AccountGet> {
    const data = {
        id: id
    }
    return await _postRequest('/account/get', data);
}

interface AccountUpdate {
    success:string|boolean
}
export async function postAccountUpdate(id:string, name:string, password:string): Promise<AccountUpdate> {
    const data = {
        id: id,
        ...(name && {name: name}),
        ...(password && {password: password})
    }
    return await _postRequest('/account/update', data);
}

interface AccountSearch {
    result: {
       id: string,
       name: string
    }[]
}
export async function postAccountSearch(name:string, limit:number, excluded_users:string[]): Promise<AccountSearch> {
    const data = {
        name: name,
        limit: limit,
        excluded_users: JSON.stringify(excluded_users),
    }
    return await _postRequest('/account/search', data);
}

interface AccountDelete {
    success: boolean,
    deleted_projects: number,
    deleted_from_projects: number
}
export async function postAccountDelete(id:string): Promise<AccountDelete> {
    const data = {
        id: id
    }
    return await _postRequest('/account/delete', data);
}
