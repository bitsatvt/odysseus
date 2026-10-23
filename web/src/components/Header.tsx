import SearchBar from './SearchBar';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/" aria-label="Odysseus Advisor home">
        <strong>ODYSSEUS</strong>
        <span>Virginia Tech</span>
      </Link>
      <div className={styles.search}><SearchBar variant="header" /></div>
    </header>
  );
}
