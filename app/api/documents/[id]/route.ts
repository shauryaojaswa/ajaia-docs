import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = (await request.json()) as {
      title?: string;
      content?: string;
    };

    const existing = await prisma.document.findUnique({
      where: { id },
      include: {
        shares: {
          where: { userId: user.id },
          select: { permission: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const isOwner = existing.ownerId === user.id;
    const canEdit = existing.shares.some((share) => share.permission === "edit");

    if (!isOwner && !canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data: { title?: string; content?: string } = {};
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.content === "string") data.content = body.content;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.document.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Failed to update document", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}
