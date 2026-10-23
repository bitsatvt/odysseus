import Link from 'next/link';
import styles from './RequirementTree.module.css';

interface PrereqNode {
  id: number;
  type: boolean;
  courseId: string | null;
  children: PrereqNode[];
}

interface PrereqTreeRendererProps {
  tree: PrereqNode;
  depth: number;
  includeParens: boolean;
}

export default function PrereqTreeRenderer({
  tree,
  depth,
  includeParens,
}: PrereqTreeRendererProps) {
  if (depth == 1 && tree.children.length == 0) {
    return <>N/A</>;
  }
  if (tree.courseId) {
    if (depth > 0 && tree.children.length > 0) {
      const childElements = tree.children.map((child, index) => (
        <span key={index}>
          {index > 0 && (tree.type ? ' or ' : ' and ')}
          <PrereqTreeRenderer
            tree={child}
            depth={depth - 1}
            includeParens={includeParens}
          />
        </span>
      ));
      return <span className={styles.branch}>{childElements}</span>;
    } else {
      return (
        <Link className={styles.course} href={`./${String(tree.courseId)}`}>
          {String(tree.courseId)}
        </Link>
      );
    }
  } else {
    const childElements = tree.children.map((child, index) => (
      <span key={index}>
        {index > 0 && (tree.type ? ' or ' : ' and ')}
        <PrereqTreeRenderer
          tree={child}
          depth={depth}
          includeParens={true}
        />
      </span>
    ));
    return includeParens ? (
      <span className={styles.group}>
        ({childElements})
      </span>
    ) : (
      <span className={styles.group}>{childElements}</span>
    );
  }
}
