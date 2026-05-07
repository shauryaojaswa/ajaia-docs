"use client";

import { useState, useRef } from "react";
import { TiptapEditor } from "@/components/editor/tiptap-editor";

interface DocumentEditorProps {
  documentId: string;
  initialTitle: string;
  initialContent: string;
  canEdit: boolean;
}

export default function DocumentEditor({
  documentId,
  initialTitle,
  initialContent,
  canEdit,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleContentUpdate(json: string) {
    setSaveStatus("saving");
    fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: json }),
    })
      .then(() => setSaveStatus("saved"))
      .catch(() => setSaveStatus("unsaved"));
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSaveStatus("unsaved");

    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      })
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("unsaved"));
    }, 800);
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          disabled={!canEdit}
          className="text-3xl font-bold text-gray-900 w-full border-none focus:outline-none bg-transparent disabled:text-gray-500"
          placeholder="Untitled Document"
        />
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-xs ${
              saveStatus === "saved"
                ? "text-green-600"
                : saveStatus === "saving"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {saveStatus === "saved"
              ? "✓ Saved"
              : saveStatus === "saving"
              ? "Saving..."
              : "Unsaved changes"}
          </span>
          {!canEdit && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
              View only
            </span>
          )}
        </div>
      </div>

      <TiptapEditor
        content={initialContent}
        onUpdate={handleContentUpdate}
        editable={canEdit}
      />
    </div>
  );
}
