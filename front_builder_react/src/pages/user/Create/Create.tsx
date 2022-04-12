import { useEffect } from 'react';
import { postAccountCreate } from '../../../partners/rest';

import './Create.scss';

export default function Create() {
    useEffect(() => {
        postAccountCreate("test", "test")
        .then((data) => 
            console.log(data)
        )
        .catch(error => {
            console.log("Error:", error);
        });
    }, []);

    return (
        <div id="create">
            Create account page
            <a href="/user/login"><button>valider</button></a>
            <a href="/user/login"><button>connexion</button></a>
        </div>
    );
}
