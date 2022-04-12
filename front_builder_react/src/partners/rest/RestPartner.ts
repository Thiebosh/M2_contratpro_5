async function _postRequest(url: string, data: {}) {
    const params = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }
    const response: Response = await fetch('http://localhost:5000' + url, params); //process.env.BACKEND_URL
    if (!response.ok) {
        return response.text().then(text => {throw new Error(text)});
    }
    return await response.json();
}

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

interface AccountUpdate {
    success:string|boolean
}
export async function postAccountUpdate(name?:string, password?:string): Promise<AccountUpdate> {
    const data = {// maybe conditionnal
        name: name,
        password: password,
    }
    return await _postRequest('/account/update', data);
}

interface AccountSearch {
    result: {
       id: string,
       name: string
    }[]
}
export async function postAccountSearch(name:string): Promise<AccountSearch> {
    const data = {
        name: name
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
