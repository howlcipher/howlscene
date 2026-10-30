import { useEffect, useId } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import { HeadingNode, $createHeadingNode } from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $setBlocksType } from "@lexical/selection";
import { type RichDocument, safeUrl } from "../../packages/core/src/rich_text";
import { readDocument, writeDocument } from "./document";
function Sync({ value }: { value: RichDocument }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const current = editor.getEditorState().read(() => readDocument());
    if (JSON.stringify(current) !== JSON.stringify(value))
      editor.update(() => writeDocument(value), { tag: "external-sync" });
  }, [editor, value]);
  return null;
}
function Toolbar() {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="text-toolbar" role="group" aria-label="Text formatting">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection))
              $setBlocksType(selection, () => $createHeadingNode("h2"));
          })
        }
      >
        Heading
      </button>
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      >
        Bullets
      </button>
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      >
        Numbered list
      </button>
      <button
        type="button"
        onClick={() => {
          const url = prompt(
            "Enter an https:// link, mailto: email, or #section anchor. Leave empty to remove.",
          );
          if (url === null) return;
          if (url === "" || safeUrl.safeParse(url).success)
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null);
          else
            alert(
              "Use a complete https:// link, mailto: email, or #section anchor.",
            );
        }}
      >
        Link
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        Undo text
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        Redo text
      </button>
    </div>
  );
}
export function RichEditor({
  value,
  onChange,
  onError,
}: {
  value: RichDocument;
  onChange: (doc: RichDocument) => void;
  onError: (message: string) => void;
}) {
  const textLabelId = useId();
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "HowlScene",
        nodes: [HeadingNode, ListNode, ListItemNode, LinkNode],
        theme: { text: { bold: "text-bold", italic: "text-italic" } },
        editorState: () => writeDocument(value),
        onError: () =>
          onError("Text editing failed. Your last saved content is preserved."),
      }}
    >
      <Toolbar />
      <p id={textLabelId} className="rich-editor-label">
        Section text
      </p>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="rich-editor"
            aria-labelledby={textLabelId}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin validateUrl={(url) => safeUrl.safeParse(url).success} />
      <Sync value={value} />
      <OnChangePlugin
        ignoreSelectionChange
        onChange={(state, _editor, tags) => {
          if (tags.has("external-sync")) return;
          try {
            onChange(state.read(() => readDocument()));
          } catch {
            onError(
              "This text is too large or has unsupported formatting. Shorten it or undo the last change.",
            );
          }
        }}
      />
    </LexicalComposer>
  );
}
