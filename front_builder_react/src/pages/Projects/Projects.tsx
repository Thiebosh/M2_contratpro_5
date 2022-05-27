import {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';

import {useUserContext} from '../../session/user';
import {Collabs} from '../../components/Collabs';
import {postProjectDelete, postProjectsSearchForUser} from '../../partners/rest';

import {dateFormat} from '../../index';

import './Projects.scss';
import dayjs from "dayjs";
import {Fade} from "react-awesome-reveal";

interface ProjectProps {
    id: string,
    name: string,
    users: {
        id: string,
        name: string,
    }[],
    syntax_name:string,
    creation: string,
    last_specs: string,
    latest_proto: boolean,
    deleteProject: Function
}
function Project(props: ProjectProps) {
    const userId = useUserContext().user.id;
    const nullableDate = (date:string) => (date && dayjs(date).format(dateFormat)) || <>-</>;

    return (
          <tr>
              <td><a className='button' href={"/project/" + props.name}>{props.name}</a></td>
              <td><Collabs usernames={props.users.filter(item => item.id !== userId).map(item => item.name)}/></td>
              <td>{props.syntax_name}</td>
              <td>{dayjs(props.creation).format(dateFormat)}</td>
              <td>{nullableDate(props.last_specs)}</td>
              <td>{props.latest_proto ? "Up to date" : "Outdated"}</td>
              <td><button className="button red" onClick={() => props.deleteProject(props.id)}><FontAwesomeIcon icon={faTrash}/></button></td>
          </tr>
    );
}

export function Projects() {
    const userId = useUserContext().user.id;

    const [projects, setProjects] = useState<ProjectProps[]>([]);
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [deleteMsg, setDeleteMsg] = useState<string>("");

    const deleteProject = (projectId: string) => {
        postProjectDelete(projectId)
          .then((data) => {
              if (!data.success) {
                  setDeleteMsg("Something wrong appened");
                  return;
              }
              // Remove project from projects list
              setProjects(projects.filter(project => project.id !== projectId));
              setSuccessMsg("Project deleted")
          })
          .catch(error => {
              setErrorMsg("Internal error");
              console.log("Error:", error);
          });
    }

    useEffect(() => {
        successMsg && setTimeout(() => setSuccessMsg(""), 4000)
    }, [successMsg, setSuccessMsg]);
    useEffect(() => {
        errorMsg && setTimeout(() => setErrorMsg(""), 4000)
    }, [errorMsg, setErrorMsg]);
    useEffect(() => {
        deleteMsg && setTimeout(() => setDeleteMsg(""), 4000)
    }, [deleteMsg, setDeleteMsg]);

    useEffect(() => {
        postProjectsSearchForUser(userId)
        .then((data: any) => {
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

          <div className="popup">
            {successMsg && <Fade>
              <div className='success'>{successMsg}</div>
            </Fade>}
            {errorMsg && <Fade>
              <div className='error'>{errorMsg}</div>
            </Fade>}
            {deleteMsg && <Fade>
              <div className='error'>{deleteMsg}</div>
            </Fade>}
          </div>

            <div className='card wide'>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Collaborators</th>
                            <th>Syntax</th>
                            <th>Creation date</th>
                            <th>Last modified</th>
                            <th>Prototype status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { projects.map((project) => <Project key={project.id} {...project} deleteProject={deleteProject}/>) }
                    </tbody>
                </table>
            </div>
        </section>
    );
}
