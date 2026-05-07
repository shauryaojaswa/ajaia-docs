# AI Workflow Note

## What I Used

I used a bunch of AI tools because different tools are good at different things.

**MiMo (Xiaomi LLM)** — My main thinking partner. Architecture decisions, debugging, understanding how libraries work internally. When I didn't understand why Tiptap was re-rendering, MiMo walked me through the useRef pattern step by step.

**Cursor** — For generating boilerplate. The CRUD API routes all follow the same pattern. Cursor generates that skeleton in seconds and I fill in the business logic.

**ChatGPT (GPT-4o)** — Security auditing. I copied my file upload route and asked it to find vulnerabilities. It caught that I was only checking file extensions, not MIME types.

**Claude (3.5 Sonnet)** — Second opinion on architecture. When MiMo suggested JWT auth, I asked Claude. Claude agreed cookies were simpler. Getting a second perspective helped me commit to the decision.

**Perplexity** — Quick research. "Does Tiptap work with Next.js 16 SSR?" "What changed in Prisma 7?"

**GitHub Copilot** — Autocomplete for repetitive code like Prisma queries and Tailwind classes.

## Where AI Saved Me Time

**Prisma schema (2 min vs 20 min)** — Described what I needed and got the full schema with relations, unique constraints, and cascade deletes. I would have forgotten cascade deletes.

**Tiptap configuration (5 min vs 45 min)** — Tiptap has 20+ extensions with scattered docs. Got the exact imports and configuration in minutes.

**The Prisma 7 disaster (saved 1+ hour)** — Accidentally installed Prisma 7 which completely changed how database connections work. MiMo immediately identified the version mismatch.

**The re-render bug (saved 30+ min)** — Described the symptoms and got the useRef + onUpdateRef pattern. I adapted it.

## What I Changed From AI Output

**Auth: JWT to Cookies** — AI's default was JWT with token refresh. For three seeded users with no passwords, that's pointless complexity.

**Toolbar: onClick to onMouseDown plus onClick split** — AI's toolbar used onClick for everything. Headings worked because they're block-level. Bold and italic didn't work because clicking a toolbar button steals focus. I added onMouseDown preventDefault to keep focus in the editor.

**Tailwind Typography to Custom CSS** — AI suggested the Tailwind Typography plugin. It broke with import errors. I wrote 40 lines of CSS instead.

**Prisma 7 to Prisma 5** — AI initially installed Prisma 7 which has a different config model. I downgraded to Prisma 5.

## What AI Got Wrong

**The share button had duplicate JSX.** AI generated the component with the button defined twice. The component silently failed to render. I found this by reading the code.

**Import/export mismatches.** AI switched between named and default exports across files. Three files needed alignment.

**The toolbar focus bug.** AI's approach was 80% correct but broke for inline formatting. The fix required understanding browser event ordering.

## How I Verified

1. Manual testing of every user flow
2. Cross-user sharing tested between all three accounts
3. Persistence verified via hard refresh
4. 6 automated tests for the markdown parser
5. Security audit via ChatGPT
