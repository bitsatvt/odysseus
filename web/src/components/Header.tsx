import SearchBar from './SearchBar';
import Link from 'next/link';
import { sitePath } from '@/site';
import styles from './Header.module.css';

export default function Header({ variant = "default" }: { variant?: "default" | "home" | "course" }) {
  return (
    <header className={`${styles.header} ${variant === "default" ? "" : styles[variant]}`}>
      <Link className={styles.wordmark} href={sitePath("/")} aria-label="Odysseus Advisor home">
        <strong>ODYSSEUS</strong>
        <span>Virginia Tech</span>
      </Link>
      {variant !== "home" && <div className={styles.search}><SearchBar variant={variant === "course" ? "course" : "header"} /></div>}
    </header>
  );
}
