import ReactDOM from "react-dom";
import styles from "./AlertModal.module.css";

const ModalOverlay =(props:{message:string; onClose: () => void;}) => {

    return (
        <div>

            {/* BACKDROP */}
            <div onClick={props.onClose} className={` ${styles.modalBackdrop} close-modal`} />

            {/* MODAL */}
            <div className={`${styles.modalBox} ${styles.modalContent}`}>

                {/* MESSAGE */}
                <h1>{props.message}</h1>

                {/* CLOSE BUTTON */}
                <button onClick={props.onClose}>ปิด</button>

            </div>

        </div>
    )
}

export default function AlertModal(props: {message:string; onClose: () => void}) {

    // use ReactDOM.createPortal() to create this modal in the div id "modals" in index.html
    
    return ReactDOM.createPortal(

        <ModalOverlay message={props.message} onClose={props.onClose} />,

        document.getElementById("modals") as HTMLElement

    );
}
