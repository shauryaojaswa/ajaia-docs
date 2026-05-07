"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data: { id?: string; documentId?: string } = await response.json();
      const documentId = data.id ?? data.documentId;
      if (!documentId) {
        throw new Error("Document id missing in response");
      }

      router.push(`/documents/${documentId}`);
      router.refresh();
    } catch (uploadError) {
      console.error(uploadError);
      setError("Upload failed. Please try again.");
      setIsUploading(false);
      event.target.value = "";
      return;
    }

    setIsUploading(false);
    event.target.value = "";
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handlePickFile}
        disabled={isUploading}
        className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isUploading ? "Uploading..." : "📄 Upload File"}
      </button>
      <p className="mt-2 text-xs text-zinc-500">Supports .txt and .md files</p>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
