"use client";

import { useState, useEffect } from "react";

interface Share {
  userId: string;
  userName: string;
  permission: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function ShareButton({
  documentId,
  currentShares,
}: {
  documentId: string;
  currentShares: Share[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [shares, setShares] = useState<Share[]>(currentShares);
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState("view");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/users")
        .then((r) => r.json())
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch(() => setError("Failed to load users"));
    }
  }, [isOpen]);

  async function handleShare() {
    if (!selectedUser) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, permission }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to share");
        return;
      }

      const sharedUser = users.find((u) => u.id === selectedUser);
      setShares((prev) => [
        ...prev,
        {
          userId: data.userId,
          userName: sharedUser?.name || "Unknown",
          permission: data.permission,
        },
      ]);
      setSelectedUser("");
    } catch {
      setError("Failed to share");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveShare(userId: string) {
    try {
      await fetch(`/api/documents/${documentId}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setShares((prev) => prev.filter((s) => s.userId !== userId));
    } catch {
      // silent fail
    }
  }

  const availableUsers = users.filter(
    (u) => !shares.some((s) => s.userId === u.id)
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
      >
        🔗 Share
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Share Document</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
              </select>
              <button
                type="button"
                onClick={handleShare}
                disabled={!selectedUser || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "..." : "Add"}
              </button>
            </div>

            <div className="space-y-2">
              {shares.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No one else has access yet.
                </p>
              ) : (
                shares.map((share) => (
                  <div
                    key={share.userId}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {share.userName}
                      </span>
                      <span
                        className={`text-xs ml-2 px-2 py-0.5 rounded ${
                          share.permission === "edit"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {share.permission}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveShare(share.userId)}
                      className="text-red-500 text-sm hover:text-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
