"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useRef } from "react";
import EditorToolbar from "./editor-toolbar";

interface TiptapEditorProps {
  content: string;
  onUpdate: (json: string) => void;
  editable?: boolean;
}

function parseContent(content: string) {
  if (!content || content === "") {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
  try {
    return JSON.parse(content);
  } catch {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
}

export function TiptapEditor({
  content,
  onUpdate,
  editable = true,
}: TiptapEditorProps) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const initialContent = useRef(parseContent(content));

  // Keep callback reference fresh without causing re-renders
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    content: initialContent.current,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Start writing your document...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    onUpdate: ({ editor }) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const json = JSON.stringify(editor.getJSON());
        onUpdateRef.current(json);
      }, 1000);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
