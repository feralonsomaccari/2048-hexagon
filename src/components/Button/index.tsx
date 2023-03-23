import styles from "./Button.module.css";

type props = {
  text: string;
  clickHandler?: React.MouseEventHandler;
  disabled?: boolean;
};

const Button = ({ text, clickHandler, disabled = false }: props) => {
  return (
    <button className={`${styles.button} ${disabled && styles.disabled}`} onClick={clickHandler} disabled={disabled}>
      {text}
    </button>
  );
};

export default Button;
