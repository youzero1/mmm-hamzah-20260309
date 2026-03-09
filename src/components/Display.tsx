import styles from './Display.module.css';

interface DisplayProps {
  display: string;
  expression: string;
  error: string | null;
}

export default function Display({ display, expression, error }: DisplayProps) {
  const fontSize =
    display.length > 12 ? '1.4rem' :
    display.length > 9 ? '1.8rem' :
    display.length > 6 ? '2.2rem' : '2.8rem';

  return (
    <div className={styles.display}>
      <div className={styles.expression}>{expression || '\u00a0'}</div>
      <div
        className={`${styles.value} ${error ? styles.error : ''}`}
        style={{ fontSize }}
      >
        {display}
      </div>
    </div>
  );
}
