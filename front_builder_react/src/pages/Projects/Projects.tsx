import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { postProjectSearchForUser } from '../../partners/rest';
import { useUserContext } from '../../session/user';

import './Projects.scss';

interface ProjectProps {
    id: string;
    name: string;
    users: {
        id: string;
        name: string;
    }[];
    creation: string;
    last_specs: string;
    last_proto: string;
}
function Project(props: ProjectProps) {
    return (
        <tr>
            <td>{props.name}</td>
            <td>todo</td>
            <td>{props.last_specs}</td>
            <td>
                <a className='button' href={"/project/"+props.id}>
                    accès
                </a>
            </td>
        </tr>
    );
}

export default function Projects() {
    const userContext = useUserContext();

    const [projects, setProjects] = useState<ProjectProps[]>([]);

    useEffect(() => {
        postProjectSearchForUser(userContext.user)
        .then((data) => {
            setProjects(data.result);
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }, [userContext.user]);

    return (
        <section id="projects">
            <div className='head'>
                <img src='' alt='avatar'/>
                <h1>Projects</h1>
                <div className='button'>
                    <FontAwesomeIcon icon={faPlus}/>
                    New project
                </div>
            </div>
            <div className='card'>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Creation date</th>
                            <th>Last modified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { projects.map((project) => <Project key={project.id} {...project}/>) }
                    </tbody>
                </table>
            </div>
        </section>
    );
}
