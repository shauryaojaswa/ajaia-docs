import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const EMPTY_TIPTAP_DOC = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export async function POST() {
  try {
    const user = await requireUser();

    const document = await prisma.document.create({
      data: {
        title: "Untitled Document",
        content: JSON.stringify(EMPTY_TIPTAP_DOC),
        ownerId: user.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Failed to create document", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
