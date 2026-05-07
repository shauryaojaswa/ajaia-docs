import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.documentShare.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const ojaswa = await prisma.user.create({
    data: {
      id: "user-ojaswa",
      name: "Ojaswa Srivastava",
      email: "ojaswa@ajaia.ai",
      avatar: "🚀",
    },
  });

  const shaurya = await prisma.user.create({
    data: {
      id: "user-shaurya",
      name: "Shaurya",
      email: "shaurya@ajaia.ai",
      avatar: "⚡",
    },
  });

  const assistant = await prisma.user.create({
    data: {
      id: "user-assistant",
      name: "Assistant Ojaswa",
      email: "assistant@ajaia.ai",
      avatar: "🤖",
    },
  });

  await prisma.document.create({
    data: {
      id: "doc-welcome",
      title: "Welcome to Ajaia Docs",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to Ajaia Docs" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is a collaborative document editor built for the Ajaia AI-Native Full Stack Developer Assignment.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Features" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Rich text editing with Tiptap" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "File upload (.txt, .md)" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Document sharing between users" }],
                  },
                ],
              },
            ],
          },
        ],
      }),
      ownerId: ojaswa.id,
    },
  });

  await prisma.document.create({
    data: {
      id: "doc-shared",
      title: "Q3 Strategy Notes",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Shared document — Shaurya owns this, Assistant Ojaswa can edit.",
              },
            ],
          },
        ],
      }),
      ownerId: shaurya.id,
      shares: {
        create: {
          userId: assistant.id,
          permission: "edit",
        },
      },
    },
  });

  console.log("Seeded:", {
    ojaswa: ojaswa.name,
    shaurya: shaurya.name,
    assistant: assistant.name,
  });
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
