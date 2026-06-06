"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  /** Remount key when switching listings or fields */
  editorKey: string;
  initialHtml: string;
  placeholder?: string;
  onChange: (html: string) => void;
  minHeight?: number;
  className?: string;
};

/**
 * Rich text editor (TipTap). Stored as HTML in `sales.description` / `sales.terms_html`.
 */
export function SaleDescriptionEditor({
  editorKey,
  initialHtml,
  placeholder = "Highlights, payment types, what's for sale, house rules…",
  onChange,
  minHeight = 220,
  className,
}: Props) {
  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Placeholder.configure({ placeholder }),
      ],
      editorProps: {
        attributes: {
          class: cn(
            "tiptap w-full max-w-none px-4 py-3 text-sm text-foreground outline-none",
            "[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:font-semibold [&_h2]:text-foreground",
            "[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:font-medium [&_h3]:text-foreground",
            "[&_p]:my-1.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          ),
          style: `min-height: ${minHeight}px`,
        },
      },
      content: initialHtml || "",
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    },
    [editorKey],
  );

  if (!editor) {
    return (
      <div
        className={cn(
          "animate-pulse overflow-hidden rounded-xl border border-border bg-muted/40",
          className,
        )}
        style={{ minHeight: minHeight + 48 }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-input bg-transparent dark:bg-input/30",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5 dark:bg-zinc-900/50">
        <EditorToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </EditorToolbarButton>
        <EditorToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </EditorToolbarButton>
        <EditorToolbarButton
          label="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </EditorToolbarButton>
        <EditorToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </EditorToolbarButton>
        <EditorToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </EditorToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function EditorToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-accent text-white shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
