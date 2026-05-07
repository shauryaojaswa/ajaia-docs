import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = (await request.json()) as {
      userId?: string;
      permission?: string;
    };

    if (!body.userId || !body.permission) {
      return NextResponse.json(
        { error: "userId and permission are required" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId: body.userId,
        },
      },
      update: {
        permission: body.permission,
      },
      create: {
        documentId: id,
        userId: body.userId,
        permission: body.permission,
      },
    });

    return NextResponse.json(share);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Failed to share document", error);
    return NextResponse.json(
      { error: "Failed to share document" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = (await request.json()) as { userId?: string };

    if (!body.userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.documentShare.delete({
      where: {
        documentId_userId: {
          documentId: id,
          userId: body.userId,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Failed to remove share", error);
    return NextResponse.json(
      { error: "Failed to remove share" },
      { status: 500 }
    );
  }
}
