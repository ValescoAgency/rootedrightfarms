import type { ReactNode } from "react";
import type { TiptapDoc, TiptapNode, TiptapMark } from "@/lib/strains/types";

interface Props {
  content: TiptapDoc;
  className?: string;
}

export function StrainDescription({ content, className }: Props) {
  return (
    <div className={["strain-description", className].filter(Boolean).join(" ")}>
      {content.content.map((node, i) => (
        <Node key={i} node={node} />
      ))}
    </div>
  );
}

function Node({ node }: { node: TiptapNode }) {
  switch (node.type) {
    case "paragraph":
      return (
        <p>
          {node.content?.map((n, i) => <Inline key={i} node={n} />)}
        </p>
      );
    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const children = node.content?.map((n, i) => <Inline key={i} node={n} />);
      if (level === 2) return <h2>{children}</h2>;
      if (level === 3) return <h3>{children}</h3>;
      return <p>{children}</p>;
    }
    case "bulletList":
      return (
        <ul>
          {node.content?.map((n, i) => <Node key={i} node={n} />)}
        </ul>
      );
    case "orderedList":
      return (
        <ol>
          {node.content?.map((n, i) => <Node key={i} node={n} />)}
        </ol>
      );
    case "listItem":
      return (
        <li>
          {node.content?.map((n, i) => <Node key={i} node={n} />)}
        </li>
      );
    case "blockquote":
      return (
        <blockquote>
          {node.content?.map((n, i) => <Node key={i} node={n} />)}
        </blockquote>
      );
    case "horizontalRule":
      return <hr />;
    case "hardBreak":
      return <br />;
    default:
      return null;
  }
}

function Inline({ node }: { node: TiptapNode }) {
  if (node.type !== "text") return null;
  return <>{applyMarks(node.text ?? "", node.marks ?? [])}</>;
}

function applyMarks(text: string, marks: TiptapMark[]): ReactNode {
  return marks.reduce<ReactNode>((el, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{el}</strong>;
      case "italic":
        return <em>{el}</em>;
      case "strike":
        return <s>{el}</s>;
      case "code":
        return <code>{el}</code>;
      case "link": {
        const href = (mark.attrs?.href as string | undefined) ?? "#";
        return <a href={href}>{el}</a>;
      }
      default:
        return el;
    }
  }, text);
}
