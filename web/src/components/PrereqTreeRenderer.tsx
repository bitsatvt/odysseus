import Link from 'next/link';

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
      return <>{childElements}</>;
    } else {
      return (
        <Link href={`./${String(tree.courseId)}`}>
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
      <>
        ({childElements})
      </>
    ) : (
      <>{childElements}</>
    );
  }
}
