import {_postRequest} from './core';

interface ProjectCreate {
    success: string|boolean
}
export async function postProjectCreate(name:string, users_id:string[], syntax_id:string, description:string): Promise<ProjectCreate> {
    const data = {
        name: name,
        users_id: JSON.stringify(users_id),
        syntax_id: syntax_id,
        description: description,
    }
    return await _postRequest('/project/create', data);
}

interface ProjectGet {
    result: {
        name:string,
        users: {
            id: string,
            name: string
        }[],
        syntax:string,
        creation:string,
        last_specs:string|null,
        latest_proto:boolean,
        description:string,
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
export async function postProjectUpdate(
    id:string,
    name:string,
    addCollabIds:string[],
    removeCollabIds:string[],
    description:string,
    deleteDescription:boolean): Promise<ProjectUpdate> {
    const data = {
        id: id,
        ...(name && {name: name}),
        ...(addCollabIds.length && {addCollabIds: JSON.stringify(addCollabIds)}),
        ...(removeCollabIds.length && {removeCollabIds: JSON.stringify(removeCollabIds)}),
        ...(description && {description: description}),
        ...(deleteDescription && {deleteDescription: deleteDescription}),
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

interface GetProtoPages {
    pages: {
        link: string,
        name: string,
    }[]
}
export async function postProjectGetProtoPages(project_id:string): Promise<GetProtoPages> {
    const data = {
        project_id: project_id
    }
    return await _postRequest('/project/get_proto_pages', data);
}

interface ProjectsSearchForUser {
    result: {
        id: string,
        name: string,
        users: {
            id: string,
            name: string
        }[],
        syntax_name: string,
        creation: string,
        last_specs: string,
        latest_proto: boolean
    }[]
}
export async function postProjectsSearchForUser(user_id:string): Promise<ProjectsSearchForUser> {
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
