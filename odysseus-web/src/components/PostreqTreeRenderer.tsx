// components/PostreqTreeRenderer.tsx
import Link from 'next/link';

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

  return [...postReqs].map((postReq, index) => {
    return (
      <Link href={`./${postReq}`}>
        {index == 0 ? '' : ','} {postReq}
      </Link>
    )
  })
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
