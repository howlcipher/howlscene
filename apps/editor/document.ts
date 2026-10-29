import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $isTextNode,
  $isElementNode,
  type ElementNode,
  type LexicalNode,
} from "lexical";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import {
  $createListNode,
  $createListItemNode,
  $isListNode,
} from "@lexical/list";
import { $createLinkNode, $isLinkNode } from "@lexical/link";
import {
  richTextSchema,
  safeUrl,
  type RichDocument,
} from "../../packages/core/src/rich_text";
type Span = Extract<
  RichDocument[number],
  { type: "paragraph" }
>["spans"][number];
function appendSpans(parent: ElementNode, spans: Span[]) {
  for (const span of spans) {
    const text = $createTextNode(span.text);
    if (span.bold) text.toggleFormat("bold");
    if (span.italic) text.toggleFormat("italic");
    parent.append(span.href ? $createLinkNode(span.href).append(text) : text);
  }
}
export function writeDocument(doc: RichDocument) {
  const root = $getRoot();
  root.clear();
  for (const block of doc) {
    if (block.type === "list") {
      const list = $createListNode(block.ordered ? "number" : "bullet");
      for (const item of block.items) {
        const node = $createListItemNode();
        appendSpans(node, item);
        list.append(node);
      }
      root.append(list);
    } else {
      const node =
        block.type === "heading"
          ? $createHeadingNode(block.level === 2 ? "h2" : "h3")
          : $createParagraphNode();
      appendSpans(node, block.spans);
      root.append(node);
    }
  }
  if (!root.getChildrenSize()) root.append($createParagraphNode());
}
function readSpans(node: LexicalNode, href?: string): Span[] {
  if ($isTextNode(node))
    return [
      {
        text: node.getTextContent(),
        bold: node.hasFormat("bold"),
        italic: node.hasFormat("italic"),
        ...(href ? { href } : {}),
      },
    ];
  if ($isElementNode(node)) {
    const url =
      $isLinkNode(node) && safeUrl.safeParse(node.getURL()).success
        ? node.getURL()
        : href;
    return node.getChildren().flatMap((child) => readSpans(child, url));
  }
  return node.getTextContent()
    ? [{ text: node.getTextContent(), bold: false, italic: false }]
    : [];
}
export function readDocument(): RichDocument {
  return richTextSchema.parse(
    $getRoot()
      .getChildren()
      .map((node) => {
        if ($isListNode(node))
          return {
            type: "list",
            ordered: node.getListType() === "number",
            items: node.getChildren().map((child) => readSpans(child)),
          };
        if ($isHeadingNode(node))
          return {
            type: "heading",
            level: node.getTag() === "h3" ? 3 : 2,
            spans: readSpans(node),
          };
        return { type: "paragraph", spans: readSpans(node) };
      }),
  );
}
