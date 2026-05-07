"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDocumentButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      const data: { id?: string } = await response.json();
      if (!data.id) {
        throw new Error("Document id missing");
      }

      router.push(`/documents/${data.id}`);
    } catch (error) {
      console.error(error);
      setIsCreating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={isCreating}
      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
    >
      {isCreating ? "Creating..." : "+ New Document"}
    </button>
  );
}
