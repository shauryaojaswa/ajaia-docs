import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type TiptapNode = {
  type: string;
  content?: TiptapNode[];
  attrs?: Record<string, string | number | boolean>;
  text?: string;
};

function toParagraphNode(text: string): TiptapNode {
  return {
    type: "paragraph",
    content: text ? [{ type: "text", text }] : undefined,
  };
}

function markdownToTiptap(text: string): TiptapNode {
  const lines = text.split(/\r?\n/);
  const content: TiptapNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    content.push({
      type: "bulletList",
      content: listBuffer.map((item) => ({
        type: "listItem",
        content: [toParagraphNode(item)],
      })),
    });
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      content.push({
        type: "heading",
        attrs: { level: headingMatch[1].length },
        content: [{ type: "text", text: headingMatch[2] }],
      });
      continue;
    }

    const bulletMatch = line.match(/^-+\s+(.+)$/);
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1]);
      continue;
    }

    flushList();
    content.push(toParagraphNode(line));
  }

  flushList();
  return { type: "doc", content };
}

function txtToTiptap(text: string): TiptapNode {
  const paragraphs = text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    type: "doc",
    content: paragraphs.map((paragraph) => toParagraphNode(paragraph)),
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const fileName = file.name || "Untitled";
    const extension = fileName.includes(".")
      ? fileName.split(".").pop()?.toLowerCase()
      : "";

    if (extension !== "txt" && extension !== "md") {
      return NextResponse.json(
        { error: "Unsupported file type. Only .txt and .md files are allowed." },
        { status: 400 }
      );
    }

    const text = await file.text();
    const tiptapDoc =
      extension === "md" ? markdownToTiptap(text) : txtToTiptap(text);

    const title = fileName.replace(/\.[^.]+$/, "") || "Untitled Document";

    const document = await prisma.document.create({
      data: {
        title,
        content: JSON.stringify(tiptapDoc),
        ownerId: user.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Failed to upload document", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
