"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { RequirementNode } from "@/server/utils/fetchTrees";
import { courseTitle } from "@/lib/course-format";
import SubjectIcon from "./SubjectIcon";
import styles from "./RequirementTree.module.css";

function Branch({ node, level = 0 }: { node: RequirementNode; level?: number }) {
  return (
    <div className={styles.branch}>
      {node.courseId && (
        <Link className={`${styles.course} ${level > 1 ? styles.distant : ""}`} href={`./${node.courseId}`} title={`${node.courseId}: ${courseTitle(node.title)}`}>
          <SubjectIcon subject={node.subject || node.courseId.split("-")[0]} />
          <span><strong>{node.courseId}</strong> {courseTitle(node.title)}</span>
        </Link>
      )}
      {node.children.length > 0 && (
        <div className={node.courseId ? styles.children : styles.alternatives}>
          {node.children.map((child, index) => (
            <div className={node.courseId ? styles.child : styles.option} key={child.id}>
              {index > 0 && <span className={styles.operator}>{node.type ? "OR" : "AND"}</span>}
              <Branch node={child} level={level + (node.courseId ? 1 : 0)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrereqTreeRenderer({ tree }: { tree: RequirementNode | null }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(true);
  const content = useRef<HTMLDivElement>(null);
  const groups = !tree ? [] : tree.type ? [{ ...tree, courseId: null }] : tree.children;

  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const limit = parseFloat(getComputedStyle(element).getPropertyValue("--tree-preview-height")) || 140;
      setOverflows(element.scrollHeight > limit + 1);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [tree]);

  return (
    <section className={`${styles.requirements} ${groups.length === 0 ? styles.emptyRequirements : ""}`} aria-labelledby="prerequisites-heading">
      <h2 id="prerequisites-heading">Pre-requisites ({groups.length})</h2>
      {groups.length ? <>
        <div id="prerequisite-tree" onFocusCapture={() => setExpanded(true)} className={`${styles.viewport} ${!expanded && overflows ? styles.collapsed : ""}`}>
          <div className={styles.columns} ref={content}>
            {groups.map((group, index) => (
              <div className={styles.requirement} key={group.id}>
                <div className={styles.requirementLabel}><span>REQ {index + 1}</span>{!group.courseId && <small>{group.type ? "ONE OF" : "ALL OF"}</small>}</div>
                <Branch node={group} />
              </div>
            ))}
          </div>
        </div>
        {overflows && <button type="button" className={styles.expand} aria-expanded={expanded} aria-controls="prerequisite-tree" onClick={() => setExpanded(!expanded)}>{expanded ? "SEE LESS −" : "SEE MORE +"}</button>}
      </> : <p className={styles.empty}>N/A</p>}
    </section>
  );
}
