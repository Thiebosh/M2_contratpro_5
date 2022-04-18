import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

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
            <td><a className='button' href={"/project/"+props.name}>{props.name}</a></td>
            <td>
                <div className='users'>
                    {props.users.map(user => (
                        <div className='bubble' key={user.name}>
                            {user.name[0]}
                            <span>{user.name}</span>
                        </div>
                    ))}
                </div>
            </td>
            <td>{moment(props.creation).format("YYYY/MM/DD HH:mm")}</td>
            <td>{moment(props.last_specs).format("YYYY/MM/DD HH:mm")}</td>
            <td>{moment(props.last_proto).format("YYYY/MM/DD HH:mm")}</td>
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
                <img src='/img/avatar.jpg' alt='avatar'/>
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
                            <th>Collaborators</th>
                            <th>Creation date</th>
                            <th>Last modified</th>
                            <th>Last prototype</th>
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
