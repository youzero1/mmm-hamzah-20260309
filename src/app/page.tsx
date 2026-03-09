import Calculator from '@/components/Calculator';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>mmm</h1>
        <p className={styles.subtitle}>Entertainment Calculator</p>
      </div>
      <Calculator />
    </main>
  );
}
