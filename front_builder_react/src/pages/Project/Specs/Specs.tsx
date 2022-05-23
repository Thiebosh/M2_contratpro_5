import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Fade} from 'react-awesome-reveal';
import {CustomTree, setGSyntax} from "../../../components/Tree";
import {postProjectExistForUser, postProjectGetSyntaxId} from '../../../partners/rest';
import {useUserContext} from '../../../session/user';
import {init_websocket} from '../../..';

import {Collabs} from '../../../components/Collabs';
import {Modal} from "../../../components/Modal";
import {findNodeWithPathForCreate, updateValueOnNode, deleteNode} from "../../../components/Tree/functions/node";
import {formatData} from "../../../components/Tree/functions/format";

import './Specs.scss';

function init(data:any, setTree:React.Dispatch<any>){
    data["root"].path = "root"
    formatData(data);
    data = data["root"];
    data.parent = null;
    setTree(data);
}

export function Specs() {
    const navigate = useNavigate();
    const { urlName } = useParams();
    const userContext = useUserContext();
    const [projectId, setProjectId] = useState<string>();
    const [isOpen, setIsOpen] = useState(false);
    const [modalElements, setModalElements] = useState([]);
    const [tree, setTree] = useState<any>();
    const [syntax, setSyntax] = useState<any>();

    useEffect(() => {
        postProjectExistForUser(userContext.user.id, urlName || "")
        .then((data) => {
            setProjectId(data.project_id);

            postProjectGetSyntaxId(data.project_id)
            .then((data) => {
                fetch("/syntaxes/"+data.id+".json")
                .then(syntax => syntax.json())
                .then(syntaxJson => {
                    setSyntax(syntaxJson);
                    setGSyntax(syntaxJson);
                })
            })
            .catch(error => {
                // setErrorMsg("Internal error");
                console.log("Error:", error);
                navigate('/projects');
            });
        })
        .catch(error => {
            // setErrorMsg("Internal error");
            console.log("Error:", error);
            navigate('/projects');
        });
    }, [userContext.user.id, urlName, navigate]);

    const [socket, setSocket] = useState<WebSocket>();
    const [socketUsable, setSocketUsable] = useState<boolean>(false);
    const [loggedCollabs, setLoggedCollabs] = useState<string[]>([]);

    const [initCollab, setInitCollab] = useState<string[]>([]);
    const [addCollab, setAddCollab] = useState<string>();
    const [removeCollab, setRemoveCollab] = useState<string>();
    useEffect(() => {
        if (initCollab.length) {
            setLoggedCollabs(initCollab);
            setInitCollab([]);
        }
    }, [initCollab]);
    useEffect(() => {
        if (addCollab) {
            setLoggedCollabs([...loggedCollabs, addCollab]);
            setAddCollab(undefined);
        }
    }, [addCollab, loggedCollabs]);
    useEffect(() => {
        if (removeCollab) {
            setLoggedCollabs([...loggedCollabs.filter(item => item !== removeCollab)]);
            setRemoveCollab(undefined);
        }
    }, [removeCollab, loggedCollabs]);

    const [chatInput, setChatInput] = useState<string>("");
    const [addChatMsg, setAddChatMsg] = useState<{author:string, text:string}|undefined>(undefined);
    const [chatMsgs, setChatMsgs] = useState<{author:string, text:string}[]>([]);
    const sendChatMsg = () => {
        if (!socket || !socketUsable) {
            setErrorMsg("Not connected to server!");
            return;
        }
        const input = chatInput.trim();
        if (input) {
            socket.send(JSON.stringify({action:"chat", chat: {author:userContext.user.name, text:input}}));
            setChatMsgs([...chatMsgs, {author:userContext.user.name, text:input}]);
        }
        setChatInput("");
    }
    useEffect(() => {
        if (addChatMsg) {
            setChatMsgs([...chatMsgs, addChatMsg])
            setAddChatMsg(undefined);
        }
    }, [chatMsgs, addChatMsg]);
    useEffect(() => {
        const element = document.getElementById("msgs") as HTMLElement;
        element.scrollTop = element.scrollHeight
    }, [chatMsgs]);

    useEffect(() => {
        if (projectId && !socketUsable) {
            // setLoadingPage(true);
            setSocket(init_websocket('specs', projectId, userContext.user.name, setSocketUsable));
        }
    }, [projectId, userContext.user.name, socketUsable]);

    const [socketActionData, setSocketActionData] = useState<any>();

    useEffect(() => {
        if (socketActionData) {
            switch(socketActionData["action"]){
                case "create":
                    const splittedPathData = socketActionData.path.split("/");
                    const content = socketActionData.content;
                    const lastPathElement = splittedPathData[splittedPathData.length - 1];
                    const isLastPathElementNumber = !isNaN(parseInt(lastPathElement));
                    //if last path element is a number : means that we are adding to an array element
                    
                    if (content && (isLastPathElementNumber || syntax[lastPathElement].type !== "array")){
                        for (let key of Object.keys(content)){
                            findNodeWithPathForCreate(socketActionData.path + "/" + key, tree, setTree); 
                            /*concat with content if not array because adding new object/field... has the new one key in socket content
                            for array, we know that we have to add a child with key equals to last path element*/
                        }
                    } else {
                        findNodeWithPathForCreate(socketActionData.path, tree, setTree);
                    }
                    break;
                case "update":
                    updateValueOnNode(socketActionData.content, socketActionData.path, tree, setTree);
                    break;
                case "delete":
                    deleteNode(socketActionData.path + "/" + socketActionData.content, tree, setTree)
                    break;
            }
            
            setSocketActionData(undefined);
        }
    }, [socketActionData, tree, syntax]);

    // function addCursor(newCollab:string) {
    //     const svg = document.querySelector('#treeContent svg') as SVGElement;
    //     const createCursor = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    //     createCursor.setAttribute("r", "6");
    //     createCursor.style.fill = "#00ff00";
    //     createCursor.id = "cursor"+newCollab;
    //     svg.appendChild(createCursor);
    // }
    // function updateCursor(currentCursor: {author:string, position:{x:number, y:number}}) {
    //     console.log(currentCursor)
    //     console.log(currentCursor["author"])
    //     const cursor = document.querySelector('#cursor'+currentCursor["author"]) as SVGElement;
    //     if (!cursor) return;
    //     console.log(cursor)

    //     cursor.setAttribute("cx", `${currentCursor["position"]["x"]}`)
    //     cursor.setAttribute("cy", `${currentCursor["position"]["y"]}`)
    // }
    // function removeCursor(oldCollab:string) {
    //     const svg = document.querySelector('#treeContent svg') as SVGElement;
    //     const cursor = document.querySelector('#cursor'+oldCollab) as SVGElement;
    //     if (!cursor) return;

    //     svg.removeChild(cursor);
    // }

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const data:Record<string, unknown> = JSON.parse(event.data)
            switch(Object.keys(data)[0]) {
                // case 'cursor':
                //     // @ts-ignore
                //     updateCursor(data["cursor"]);
                //     break;

                case 'init_collabs':
                    setInitCollab(data["init_collabs"] as string[]);
                    break;
                case 'add_collab':
                    const newCollab = data["add_collab"] as string;
                    setAddCollab(newCollab);
                    // addCursor(newCollab);
                    break;
                case 'remove_collab':
                    const oldCollab = data["remove_collab"] as string;
                    setRemoveCollab(oldCollab);
                    // removeCursor(oldCollab);
                    break;

                case 'init_chat':
                    //@ts-ignore
                    setChatMsgs(data["init_chat"]);
                    break;
                case 'chat':
                    //@ts-ignore
                    setAddChatMsg(data["chat"]);
                    break;

                case 'init_tree':
                    console.log("receive", data["init_tree"])
                    init(data["init_tree"], setTree);
                    break;
                case 'save':
                    data["save"] ? setSuccessMsg("Save: success") : setErrorMsg("Save: failure");
                    break;
                case 'generate':
                    data["generate"] ? setSuccessMsg("Generate: success") : setErrorMsg("Generate: failure");
                    break;
                case "create":
                    if (!data["create"]) setErrorMsg("Create: failure");
                    break;
            }
            
            if("action" in data){
                console.log(data);
                setSocketActionData(data);                
            }
        };

        return () => {
            setSocketUsable(false);
            // setTree(undefined);
            socket.close();
        }
    }, [socket]);

    useEffect(() => {
        if (!(socket && socketUsable)) return;

        return () => {
            setSocketUsable(false);
            // setTree(undefined);
            socket.close();
        }
    }, [socket, socketUsable]);

    // useEffect(() => {
    //     if (!(socket && socketUsable && tree)) return;

    //     const svg = document.querySelector('#treeContent svg') as SVGElement;
    //     if (!svg) return;

    //     var lastCall = 0;
    //     svg.onmousemove = (e) => {
    //         var now = Date.now();
    //         if (lastCall + 100 > now) return;
    //         lastCall = now;

    //         //@ts-ignore
    //         const pt = new DOMPointReadOnly(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    //         socket.send(JSON.stringify({action: "cursor", position: {x: pt.x, y: pt.y}}));

    //     }
    // }, [socket, socketUsable, tree]);

    const [successMsg, setSuccessMsg] = useState<string>("");
    const [infoMsg, setInfoMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    useEffect(() => {
        if (successMsg) setTimeout(() => setSuccessMsg(""), 4000);
    }, [successMsg]);
    useEffect(() => {
        if (infoMsg) setTimeout(() => setInfoMsg(""), 4000);
    }, [infoMsg]);
    useEffect(() => {
        if (errorMsg) setTimeout(() => setErrorMsg(""), 4000);
    }, [errorMsg]);

    function triggerGenerate() {
        if (!socket || !socketUsable) {
            setErrorMsg("Not connected to server!");
            return;
        }
        setInfoMsg("Send generation request...");
        socket.send(JSON.stringify({"action":"generate"}));
    }

    function triggerSave() {
        if (!socket || !socketUsable) {
            setErrorMsg("Not connected to server!");
            return;
        }
        setInfoMsg("Send save request...");
        socket.send(JSON.stringify({"action":"save"}));
    }

    return (
        <section id="specs" className={isOpen ? "overlay": ""}>
            <div className={"hover_menu" + (isOpen ? " inactive" : "")}>
                <div className="menu">
                    <p onClick={triggerSave}>Save specifications</p>
                    <hr/>
                    <p onClick={triggerGenerate}>Generate prototype</p>
                </div>
                <div className="users">
                    <Collabs usernames={[userContext.user.name+" (you)", ...loggedCollabs]} />
                </div>
            </div>

            <div className="chat">
                <h4>Chat</h4>
                <div id="msgs">
                    { chatMsgs.map((item, index) => (<div key={item.author+index}><span className="bold">{item.author}</span> - {item.text}</div>)) }
                </div>
                <hr/>
                <input
                    type="text"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onKeyDown={(event) => (event.key === "Enter") && sendChatMsg()}
                />
            </div>

            <div className='popup'>
                { successMsg && <Fade><div className='success'>{successMsg}</div></Fade> }
                { infoMsg && <Fade><div className='info'>{infoMsg}</div></Fade> }
                { errorMsg && <Fade><div className='error'>{errorMsg}</div></Fade> }
            </div>
            <div id="treeContent" className={isOpen ? "inactive": ""}>
                { socketUsable
                    ? (tree
                        ? <CustomTree tree={tree} setTree={setTree} setIsOpen={setIsOpen} socket={socket} setModalElements={setModalElements}/>
                        : <p className='centered'>Loading...</p>
                    )
                    : <p className='centered'>Connection to server...</p>
                }
            </div>
            {isOpen && <Modal title="Add element" setIsOpen={setIsOpen} elements={modalElements}/>}
        </section>
    );
}
