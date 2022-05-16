import "./Modal.scss"

interface ModalProps {
    openClose:Function
}

export function Modal(props:ModalProps){
    return (
        <>
        <div className="modal">
            <header className="modal-header">
                <h2>Modal Title</h2>
                <button onClick={() => closeModal(props.openClose)} className="close-button">&times;</button>
            </header>
            <main className="modal-main">
                <div id="modal-content">
                </div>
            </main>
        </div>
    </>
    )
}

function closeModal(openClose:Function){
    openClose(false)
}