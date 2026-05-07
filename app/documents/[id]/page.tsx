import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DocumentEditor from "./document-editor";
import { ShareButton } from "./share-button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: true,
      shares: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!document) {
    notFound();
  }

  const isOwner = document.ownerId === user.id;
  const sharedRecord = document.shares.find((share) => share.userId === user.id);
  const isShared = Boolean(sharedRecord);

  if (!isOwner && !isShared) {
    return (
      <div className="min-h-screen bg-zinc-100 px-4 py-10">
        <main className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <p className="text-zinc-700">You don&apos;t have access</p>
          <Link
            href="/documents"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Go back
          </Link>
        </main>
      </div>
    );
  }

  const canEdit = isOwner || sharedRecord?.permission === "edit";

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-900">
      <main className="mx-auto w-full max-w-5xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              ← Back
            </Link>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isOwner
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isOwner ? "Owner" : "Shared"}
            </span>

            {/* THIS IS THE FIX — use the real ShareButton component */}
            {isOwner && (
              <ShareButton
                documentId={document.id}
                currentShares={document.shares.map((s) => ({
                  userId: s.userId,
                  userName: s.user.name,
                  permission: s.permission,
                }))}
              />
            )}
          </div>

          <p className="text-sm text-zinc-600">
            {user.name} ({user.email})
          </p>
        </header>

        <DocumentEditor
          documentId={document.id}
          initialTitle={document.title}
          initialContent={document.content}
          canEdit={canEdit}
        />
      </main>
    </div>
  );
}
