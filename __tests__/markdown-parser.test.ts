import { describe, it, expect } from "vitest";

function parseBasicMarkdown(text: string): any {
  const lines = text.split("\n");
  const content: any[] = [];
  for (const line of lines) {
    if (line.startsWith("# ")) {
      content.push({
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: line.slice(2) }],
      });
    } else if (line.startsWith("## ")) {
      content.push({
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: line.slice(3) }],
      });
    } else if (line.startsWith("- ")) {
      content.push({
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: line.slice(2) }],
              },
            ],
          },
        ],
      });
    } else if (line.trim() === "") {
      continue;
    } else {
      content.push({ type: "paragraph", content: [{ type: "text", text: line }] });
    }
  }
  return { type: "doc", content };
}

describe("parseBasicMarkdown", () => {
  it("parses h1", () => {
    const result = parseBasicMarkdown("# Hello");
    expect(result.content[0].type).toBe("heading");
    expect(result.content[0].attrs.level).toBe(1);
  });

  it("parses h2", () => {
    const result = parseBasicMarkdown("## World");
    expect(result.content[0].type).toBe("heading");
    expect(result.content[0].attrs.level).toBe(2);
  });

  it("parses bullets", () => {
    const result = parseBasicMarkdown("- item1\n- item2");
    expect(result.content).toHaveLength(2);
    expect(result.content[0].type).toBe("bulletList");
    expect(result.content[1].type).toBe("bulletList");
  });

  it("parses paragraphs", () => {
    const result = parseBasicMarkdown("just text");
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("paragraph");
  });

  it("parses mixed", () => {
    const result = parseBasicMarkdown("# Title\n\nText\n- item");
    expect(result.content).toHaveLength(3);
  });

  it("handles empty", () => {
    const result = parseBasicMarkdown("");
    expect(result.content).toEqual([]);
  });
});
