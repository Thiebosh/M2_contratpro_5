import "./Modal.scss"

interface ModalProps {
    openClose:Function,
    elements:{
        text: string,
        onclick:any
    }[],
}

export function Modal(props:ModalProps){
    return (
        <div className="modal">
            <header className="modal-header">
                <h2>Modal Title</h2>
                <button onClick={() => props.openClose(false)} className="close-button">&times;</button>
            </header>
            <main className="modal-main">
                <div id="modal-content">
                    <h3>Que souhaitez-vous ajouter ?</h3>
                    {props.elements.map(item => <div className="modalInput" onClick={item.onclick}>{item.text.charAt(0).toUpperCase() + item.text.slice(1)}</div>)}
                </div>
            </main>
        </div>
    )
}