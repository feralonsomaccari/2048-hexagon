import styles from "./Button.module.css";

type props = {
  text: string;
  clickHandler?: () => void;
  disabled?: boolean;
  extraProps?: object
};

const Button = ({ text, clickHandler, disabled = false, extraProps }: props) => {
  return (
    <button {...extraProps} className={`${styles.button} ${disabled && styles.disabled}`} onClick={clickHandler} disabled={disabled}>
      {text}
    </button>
  );
};

export default Button;
