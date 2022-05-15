import {_postRequest} from './core';

interface SyntaxGetList {
    result: {
        id:string,
        name:string,
        description:string,
    }[]
}
export async function postSyntaxGetList(): Promise<SyntaxGetList> {
    const data = {
        // todo : pattern to search
    }
    return await _postRequest('/syntax/get', data);
}
