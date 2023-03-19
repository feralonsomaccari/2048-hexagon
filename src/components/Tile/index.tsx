import styles from './Tile.module.css'

type props = {
    value: number;
    style: {};
  };
  
const Tile = ({value, style} : props) : JSX.Element => {
  return (
    <div className={styles.tile}>Tile</div>
  )
}

export default Tile