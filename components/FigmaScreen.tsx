import Link from "next/link";
import { figmaToReact, FigmaNode } from "@/lib/figma-render";
import { linkPropsFromNode } from "@/lib/route-map";
import React from "react";

interface FigmaScreenProps {
  data: FigmaNode;
}

export function FigmaScreen({ data }: FigmaScreenProps) {
  function render(node: FigmaNode): React.ReactNode {
    const element = figmaToReact(node, {}, render);
    const { href, as } = linkPropsFromNode(node);
    return href ? <Link href={href} as={as}>{element}</Link> : element;
  }

  return <>{render(data)}</>;
}
