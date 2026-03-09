import styles from './Button.module.css';

interface ButtonProps {
  label: string;
  type: 'digit' | 'operator' | 'special' | 'equals';
  onClick: () => void;
}

export default function Button({ label, type, onClick }: ButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[type]}`}
      onClick={onClick}
      aria-label={label}
    >
      {label}
    </button>
  );
}
