import { useEffect, useState } from 'react';
import { getSessionUser } from '../../../session/user';
import { postAccountGet } from '../../../partners/rest';

import './Profile.scss';

export function Profile() {
    const [name, setName] = useState<string>("");

    useEffect(() => {
        postAccountGet(getSessionUser() || "")
        .then((data) => {
            setName(data.name);
        })
        .catch(error => {
            console.log("Error:", error);
        });
    }, []);

    return (
        <div id="profile">
            Profile page<br/>
            display account data : {name}<br/>
            <a href="/user/settings"><button>modifier compte</button></a>
        </div>
    );
}
