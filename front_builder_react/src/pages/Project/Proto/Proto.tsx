import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { init_websocket } from '../../..';

import { postProjectExistForUser } from '../../../partners/rest';
import { useUserContext } from '../../../session/user';

import './Proto.scss';

interface ExecutionWindowProps {
    proto: string|undefined,
}
function ExecutionWindow(props:ExecutionWindowProps) {
    const proto = props.proto;

    // to visualize prototype
    // $("#exec_window").html(resp);

    // to intercept links
    // $("#exec_window a").on("click", function(event) {
    //     event.preventDefault(); 
    //     event.stopPropagation();
    //     msg = JSON.stringify({"action":"execute", "page": $("a").attr('href')});
    //     socket.send(msg);
    // });

    return (<div id="exec_window">
        {proto}
    </div>);
}

export function Proto() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();

    useEffect(() => {
        postProjectExistForUser(userContext.user.id, urlName || "")
        .then((data) => {
            if (!data.id) {
                navigate('/projects');
                return;
            }
            setSocket(init_websocket('proto', data.id, userContext.user.name, setSocketUsable));
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user, urlName, navigate]);

    const [socket, setSocket] = useState<WebSocket>();
    const [socketUsable, setSocketUsable] = useState<boolean>(false);

    const [loadingPage, setLoadingPage] = useState<boolean>(true);
    const [pages, setPages] = useState<{link:string, name:string}[]>([]);
    const [proto, setProto] = useState<string>("{}");

    useEffect(() => {
        setPages([ // tmp
            {
                link: "",
                name: "fil",
            },
            {
                link: "",
                name: "d'ariane",
            },
            {
                link: "",
                name: ":",
            },
            {
                link: "",
                name: "liens",
            },
            {
                link: "",
                name: "d'accès",
            },
            {
                link: "",
                name: "aux",
            },
            {
                link: "",
                name: "pages",
            },
            {
                link: "",
                name: "du",
            },
            {
                link: "",
                name: "prototype",
            },
        ]);
        if (!socket) return;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log(data);
            if (data.execute.success) {
                setLoadingPage(false);
                setProto(data.execute.content);
            }
            else {
                setProto("Error");
            }
        };

        return () => socket.close();
    }, [socket]);

    useEffect(() => {
        if (!(socket && socketUsable)) return;
        socket.send(JSON.stringify({"action":"execute", "page": ""})) // no page for default page
    }, [socket, socketUsable]);

    function triggerLink(page:string) {
        if (!socket || !socketUsable) {
            return;
        }
        setLoadingPage(true);
        socket.send(JSON.stringify({"action":"execute", "page": page}));
    }

    return (
        <section id="proto">
            <div className='links'>
                { pages.map(item => <p key={item.name} onClick={() => triggerLink(item.link)}>{item.name}</p>) }
            </div>
            <ExecutionWindow proto={socketUsable ? (loadingPage ? "Loading..." : JSON.stringify(proto)) : "Connection to server..."}/>
        </section>
    );
}
