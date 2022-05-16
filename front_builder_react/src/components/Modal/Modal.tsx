import "./Modal.scss"

interface ModalProps {
    openClose:Function
}

export function Modal(props:ModalProps){
    return (
        <>
        <div className="modal">
            <header className="modal_header">
            <h2>Modal Title</h2>
            <button onClick={() => closeModal(props.openClose)} className="close-button">&times;</button>
            </header>
            <main className="modal_main">
            <p>Some content here!</p>
            </main>
        </div>
    </>
    )
}

function closeModal(openClose:Function){
    openClose(false)
}