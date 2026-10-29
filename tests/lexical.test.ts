import { it, expect } from "vitest";
import { createEditor } from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { readDocument, writeDocument } from "../apps/editor/document";
import { richTextSchema } from "../packages/core/src/rich_text";
it("TXT-001 converts every portable rich text node through Lexical without loss", () => {
  const source = richTextSchema.parse([
    { type: "heading", level: 2, spans: [{ text: "Hello", bold: true }] },
    {
      type: "paragraph",
      spans: [
        { text: "Welcome ", italic: true },
        { text: "Read", href: "https://example.com" },
      ],
    },
    {
      type: "list",
      ordered: false,
      items: [[{ text: "One" }], [{ text: "Two", bold: true }]],
    },
    { type: "list", ordered: true, items: [[{ text: "Ordered" }]] },
  ]);
  const editor = createEditor({
    namespace: "test",
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode],
    onError: (e) => {
      throw e;
    },
  });
  editor.update(() => writeDocument(source), { discrete: true });
  expect(editor.getEditorState().read(() => readDocument())).toEqual(source);
});
