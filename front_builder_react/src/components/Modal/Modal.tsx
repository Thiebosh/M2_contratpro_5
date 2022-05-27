import "./Modal.scss"

interface ModalProps {
    title:string,
    setIsOpen:React.Dispatch<React.SetStateAction<boolean>>,
    elements:{
        text: string,
        onclick:any
    }[],
}

export function Modal(props:ModalProps){
    function closeModal() {
        props.setIsOpen(false);
    }

    function stopEvent(event:React.MouseEvent<HTMLDivElement, MouseEvent>) {
        event.preventDefault();
        event.stopPropagation();
    }

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={stopEvent}>
                <header className="modal-header">
                    <h2>{props.title}</h2>
                    <button onClick={() => props.setIsOpen(false)} className="close-button">&times;</button>
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
        </div>
    )
}
