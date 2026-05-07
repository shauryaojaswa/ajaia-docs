import Link from "next/link";
import { redirect } from "next/navigation";
import UploadButton from "@/components/upload-button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";
import NewDocumentButton from "./new-doc-button";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const [ownedDocuments, sharedDocuments] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.document.findMany({
      where: {
        shares: {
          some: { userId: user.id },
        },
      },
      include: {
        owner: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900">
      <main className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ajaia Docs</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Signed in as <span className="font-medium">{user.name}</span> (
              {user.email})
            </p>
          </div>
          <div>
            <LogoutButton />
          </div>
        </header>

        <section className="mb-8 flex flex-wrap gap-3">
          <NewDocumentButton />
          <UploadButton />
        </section>

        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Documents</h2>
          </div>

          {ownedDocuments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
              You do not have any documents yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {ownedDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-medium">{doc.title}</h3>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Owner
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    Last edited {formatDate(doc.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Shared With Me</h2>
          </div>

          {sharedDocuments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
              No documents have been shared with you yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {sharedDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-medium">{doc.title}</h3>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Shared
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    Owner: {doc.owner.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
