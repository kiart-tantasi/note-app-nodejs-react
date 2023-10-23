import styles from "./Popup.module.css";

type PopupProps = {
  onClick: () => void;
  mainText: string;
  extraText?: string;
  onConfirm?: {
    text: string;
    fn: () => void;
  };
}

export default function Popup(props: PopupProps) {

  return (
    <div className={styles["pop-up"]}>

      {/* MAIN TEXT */}
      <p>{props.mainText}</p>

      {/* EXTRA TEXT IF USED */}
      {props.extraText && <p>{props.extraText}</p>}

      {/* BUTTONS */}
      <div className={styles["button-container"]}>

          {/* CONFIRM BUTTON */}
          {props.onConfirm && <button className={styles.button} onClick={props.onConfirm.fn}>{props.onConfirm.text}</button>}

          {/* CLOSE BUTTON */}
          <button className={styles.button} onClick={props.onClick}>ปิด</button>

      </div>

    </div>
  )
}
