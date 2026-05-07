import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  async function loginAction(formData: FormData) {
    "use server";

    const userId = formData.get("userId");
    if (typeof userId !== "string" || !userId) {
      throw new Error("Invalid user");
    }

    const cookieStore = await cookies();
    cookieStore.set("userId", userId, {
      httpOnly: true,
      path: "/",
      maxAge: 86400,
    });

    redirect("/documents");
  }

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
      <main className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Ajaia Docs</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Select your account to continue
          </p>
        </div>

        <div className="grid gap-3">
          {users.map((user) => (
            <form key={user.id} action={loginAction}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="flex w-full items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-xl">
                  {user.avatar ?? "👤"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{user.name}</span>
                  <span className="block truncate text-sm text-zinc-500">
                    {user.email}
                  </span>
                </span>
              </button>
            </form>
          ))}
        </div>
      </main>
    </div>
  );
}
