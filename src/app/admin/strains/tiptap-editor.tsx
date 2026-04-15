"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { TiptapDoc } from "@/lib/strains/types";

interface TiptapEditorProps {
  name: string;
  defaultValue?: TiptapDoc | null;
  error?: string;
}

/**
 * Controlled rich-text editor backed by Tiptap. Syncs HTML content to a
 * hidden <input> so it submits with the parent form via useActionState.
 */
export function TiptapEditor({ name, defaultValue, error }: TiptapEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: defaultValue ?? "",
    onUpdate: ({ editor }) => {
      if (inputRef.current) {
        inputRef.current.value = editor.isEmpty ? "" : JSON.stringify(editor.getJSON());
      }
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] px-4 py-3 outline-none text-[var(--color-ink)] text-sm leading-relaxed",
        "data-tiptap": "true",
      },
    },
  });

  // Seed the hidden input on mount so the initial value is correct if the
  // user submits without making any changes.
  useEffect(() => {
    if (inputRef.current && editor) {
      inputRef.current.value = editor.isEmpty ? "" : JSON.stringify(editor.getJSON());
    }
  }, [editor]);

  return (
    <>
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue ? JSON.stringify(defaultValue) : ""}
      />
      <div
        className={[
          "border-[1.5px] rounded-[var(--radius-md)] bg-[var(--color-bg)] overflow-hidden",
          error
            ? "border-[var(--color-error)]"
            : "border-[var(--color-border)] focus-within:border-[var(--color-accent)]",
        ].join(" ")}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap gap-0.5 px-2 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface,var(--color-bg))]">
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            title="Bold (⌘B)"
          >
            <Bold size={13} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
            title="Italic (⌘I)"
          >
            <Italic size={13} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive("underline")}
            title="Underline (⌘U)"
          >
            <Underline size={13} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough size={13} />
          </ToolBtn>

          <Sep />

          <ToolBtn
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor?.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={13} />
          </ToolBtn>
          <ToolBtn
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor?.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={13} />
          </ToolBtn>

          <Sep />

          <ToolBtn
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            title="Bullet list"
          >
            <List size={13} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
            title="Ordered list"
          >
            <ListOrdered size={13} />
          </ToolBtn>

          <Sep />

          <ToolBtn
            onClick={() => {
              const prev = editor?.getAttributes("link").href as
                | string
                | undefined;
              const url = window.prompt("Link URL (leave empty to remove)", prev ?? "https://");
              if (url === null) return;
              if (url.trim() === "") {
                editor?.chain().focus().unsetLink().run();
              } else {
                editor
                  ?.chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: url.trim() })
                  .run();
              }
            }}
            active={editor?.isActive("link")}
            title="Link"
          >
            <LinkIcon size={13} />
          </ToolBtn>
        </div>

        {/* Editable content */}
        <EditorContent editor={editor} />
      </div>
      {/* Minimal prose styles — no @tailwindcss/typography in this project */}
      <style>{`
        [data-tiptap] h2 { font-family: var(--font-serif, Georgia, serif); font-size: 1.15rem; font-weight: 600; margin: 0.75rem 0 0.25rem; }
        [data-tiptap] h3 { font-family: var(--font-serif, Georgia, serif); font-size: 1rem; font-weight: 600; margin: 0.6rem 0 0.2rem; }
        [data-tiptap] ul { list-style: disc; padding-left: 1.25rem; margin: 0.4rem 0; }
        [data-tiptap] ol { list-style: decimal; padding-left: 1.25rem; margin: 0.4rem 0; }
        [data-tiptap] li { margin: 0.15rem 0; }
        [data-tiptap] a { color: var(--color-accent); text-decoration: underline; }
        [data-tiptap] p { margin: 0.25rem 0; }
        [data-tiptap] p:first-child { margin-top: 0; }
        [data-tiptap] p:last-child { margin-bottom: 0; }
        [data-tiptap].ProseMirror-focused { outline: none; }
      `}</style>
    </>
  );
}

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "p-1.5 rounded min-w-[28px] min-h-[28px] flex items-center justify-center transition-colors",
        active
          ? "bg-[var(--color-accent)] text-[var(--color-ink-inverse)]"
          : "text-[var(--color-ink-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Sep() {
  return (
    <div
      aria-hidden
      className="w-px h-5 bg-[var(--color-border)] mx-1 self-center"
    />
  );
}
