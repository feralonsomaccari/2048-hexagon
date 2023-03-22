import styles from "./Button.module.css";

type props = {
  text: string;
  clickHandler?: React.MouseEventHandler;
};

const Button = ({ text, clickHandler }: props) => {
  return (
    <button className={styles.button} onClick={clickHandler}>
      {text}
    </button>
  );
};

export default Button;
