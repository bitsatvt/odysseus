"use client";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import styles from './page.module.css';

export default function Page() {
  return (
    <div className={styles.page}>
      <div className={styles.ambientBars} aria-hidden="true">
        {Array.from({ length: 27 }).map((_, index) => <span key={index} />)}
      </div>
      <div className={styles.contentFade} aria-hidden="true" />
      <header className={styles.homeHeader}>
        <Link className={styles.wordmark} href="/" aria-label="Odysseus Advisor home">
          <strong>ODYSSEUS</strong>
          <span>Virginia Tech</span>
        </Link>
      </header>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1><span>Plan your semester with</span><span>confidence.</span></h1>
          <div className={styles.searchRow}>
            <SearchBar variant="hero" />
          </div>
        </div>
        <div className={styles.preview} aria-label="Preview of Odysseus course insights">
          <div className={`${styles.previewLayer} ${styles.coursePreview}`}>
            <img src="/figma/hero-course.png" alt="Odysseus course and prerequisite information" />
            <img className={styles.blurLow} src="/figma/hero-course.png" alt="" aria-hidden="true" />
            <img className={styles.blurMid} src="/figma/hero-course.png" alt="" aria-hidden="true" />
            <img className={styles.blurHigh} src="/figma/hero-course.png" alt="" aria-hidden="true" />
          </div>
          <div className={`${styles.previewLayer} ${styles.chartPreview}`}>
            <img src="/figma/hero-chart.png" alt="Odysseus grade distribution visualization" />
            <img className={styles.blurLow} src="/figma/hero-chart.png" alt="" aria-hidden="true" />
            <img className={styles.blurMid} src="/figma/hero-chart.png" alt="" aria-hidden="true" />
            <img className={styles.blurHigh} src="/figma/hero-chart.png" alt="" aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  );
}
