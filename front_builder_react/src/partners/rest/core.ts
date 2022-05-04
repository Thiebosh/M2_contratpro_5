export async function _postRequest(url: string, data: {}) {
    const params = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }
    const response: Response = await fetch('http://rest:5000' + url, params); //process.env.BACKEND_URL
    if (!response.ok) {
        return response.text().then(text => {throw new Error(text)});
    }
    return await response.json();
}
