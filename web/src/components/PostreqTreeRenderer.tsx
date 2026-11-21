"use client";

import { useState } from "react";
import Link from "next/link";
import type { RequirementNode } from "@/server/utils/fetchTrees";
import styles from "./RequirementTree.module.css";

export default function PostreqTreeRenderer({ tree }: { tree: RequirementNode }) {
  const [expanded, setExpanded] = useState(false);
  const courses = new Set<string>();
  function traverse(node: RequirementNode) {
    if (node.courseId) courses.add(node.courseId);
    else node.children.forEach(traverse);
  }
  traverse(tree);
  const ids = [...courses];
  if (!ids.length) return <>None</>;
  return <span className={styles.postreqList}>
    {(expanded || ids.length <= 2 ? ids : []).map((id) => <Link className={styles.postreq} key={id} href={`./${id}`}>{id}</Link>)}
    {ids.length > 2 && <button type="button" className={styles.moreRelated} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Show less" : `${ids.length} courses`}</button>}
  </span>;
}
