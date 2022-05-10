import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

import { useUserContext } from '../../session/user';
import { Collabs } from '../../components/Collabs';
import { postProjectSearchForUser } from '../../partners/rest';

import {dateFormat} from '../../index';

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
    proto_synchro: boolean;
}
function Project(props: ProjectProps) {
    const userId = useUserContext().user.id;
    const nullableDate = (date:string) => (date && moment(date).format(dateFormat)) || <>-</>;
    return (
        <tr>
            <td><a className='button' href={"/project/"+props.name}>{props.name}</a></td>
            <td><Collabs usernames={props.users.filter(item => item.id !== userId).map(item => item.name)} /></td>
            <td>{moment(props.creation).format(dateFormat)}</td>
            <td>{nullableDate(props.last_specs)}</td>
            <td>{props.proto_synchro ? "Up to date" : "Outdated"}</td>
        </tr>
    );
}

export function Projects() {
    const userId = useUserContext().user.id;

    const [projects, setProjects] = useState<ProjectProps[]>([]);

    useEffect(() => {
        postProjectSearchForUser(userId)
        .then((data) => {
            setProjects(data.result);
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
        });
    }, [userId]);

    return (
        <section id="projects">
            <div className='head'>
                <img src='/img/avatar.jpg' alt='avatar'/>
                <h1>Projects</h1>
                <a className='button' href='/projects/create'>
                    <FontAwesomeIcon icon={faPlus}/>
                    New project
                </a>
            </div>
            <div className='card wide'>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Collaborators</th>
                            <th>Creation date</th>
                            <th>Last modified</th>
                            <th>Prototype status</th>
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
