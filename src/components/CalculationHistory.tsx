import styles from './CalculationHistory.module.css';

interface HistoryItem {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

interface Props {
  history: HistoryItem[];
  onSelect: (result: string) => void;
}

export default function CalculationHistory({ history, onSelect }: Props) {
  if (history.length === 0) {
    return (
      <div className={styles.empty}>
        <span>No calculations yet</span>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {history.map((item) => (
        <button
          key={item.id}
          className={styles.item}
          onClick={() => onSelect(item.result)}
          title="Click to use this result"
        >
          <span className={styles.expr}>{item.expression}</span>
          <span className={styles.result}>= {item.result}</span>
          <span className={styles.time}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </button>
      ))}
    </div>
  );
}
