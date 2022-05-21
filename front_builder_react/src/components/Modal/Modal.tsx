import "./Modal.scss"

interface ModalProps {
    title:string,
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
                <h2>{props.title}</h2>
                <button onClick={() => props.openClose(false)} className="close-button">&times;</button>
            </header>
            <main className="modal-main">
                <h3>What would you like to add?</h3>
                <div className="modal-content">
                    {props.elements.map(item => (
                      <div key={item.text} className="button" onClick={item.onclick}>
                        {item.text.charAt(0).toUpperCase() + item.text.slice(1)}
                      </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
