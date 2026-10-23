// components/PostreqTreeRenderer.tsx
import Link from 'next/link';
import styles from './RequirementTree.module.css';

interface PostreqNode {
  id: number;
  type: boolean;
  courseId: string | null;
  children: PostreqNode[];
}

interface PostreqTreeRendererProps {
  tree: PostreqNode;
}

export default function PostreqTreeRenderer({
  tree,
}: PostreqTreeRendererProps) {
  const postReqs = new Set<string>();
  traversePostreqs(tree, postReqs);

  if (postReqs.size === 0) {
    return <>N/A</>;
  }

  return (
    <span className={styles.postreqList}>
      {[...postReqs].map((postReq) => (
        <Link className={styles.postreq} key={postReq} href={`./${postReq}`}>
          {postReq}
        </Link>
      ))}
    </span>
  );
}

function traversePostreqs(tree: PostreqNode, postReqs: Set<string>) {
  if (tree.courseId != null) { // found class
    postReqs.add(tree.courseId);
    return;
  }

  for (const node of tree.children) {
    traversePostreqs(node, postReqs);
  }
}
