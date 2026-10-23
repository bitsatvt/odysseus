"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

export default function Footer() {
  const isHomePage = usePathname() === '/';
  return (
    <footer className={`${styles.footer} ${isHomePage ? styles.home : ''}`}>
      <span>© {new Date().getFullYear()} Odysseus Developers</span>
      <nav aria-label="Odysseus community links">
        <Link href="https://discord.gg/vRjUxzrkEc" aria-label="Odysseus Discord">
          <img src="/figma/discord.svg" alt="" />
        </Link>
        <Link href="https://github.com/bitsatvt/odysseus" aria-label="Odysseus GitHub">
          <img src="/figma/github-fill.svg" alt="" />
        </Link>
      </nav>
    </footer>
  );
}
