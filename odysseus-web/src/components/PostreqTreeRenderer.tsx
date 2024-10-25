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
  depth: number;
}

export default function PostreqTreeRenderer({
  tree,
  depth,
}: PostreqTreeRendererProps) {
  if (tree.courseId) {
    if (depth > 0 && tree.children.length > 0) {
      const childElements = tree.children.map((child, index) => (
        <span key={index}>
          {index > 0 && ', '}
          <PostreqTreeRenderer tree={child} depth={depth - 1} />
        </span>
      ));
      return <>{childElements}</>;
    } else {
      return (
        <Link href={`./${String(tree.courseId)}`}>
          {String(tree.courseId)}
        </Link>
      );
    }
  } else {
    if (tree.children.length === 0) {
      return <>N/A</>;
    }
    const childElements = tree.children.map((child, index) => (
      <span key={index}>
        {index > 0 && ', '}
        <PostreqTreeRenderer tree={child} depth={depth} />
      </span>
    ));
    return <>{childElements}</>;
  }
}
