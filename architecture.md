# Architecture Note

## My Approach

The assignment said "build a lightweight collaborative document editor" with a 4-6 hour time limit. My first thought was: don't build Google Docs. Build the 20% of Google Docs that proves I know what I'm doing.

I focused on one loop: Create, Edit with real formatting, Auto-save, Share, Come back later and it's still there. If that loop doesn't feel good, nothing else matters.

## Key Decisions

### Why Tiptap and not Draft.js or Slate

I've used all three before. Draft.js is Facebook's editor but it's basically abandoned. Slate is powerful but the API changes constantly and the learning curve is steep. Tiptap sits on top of ProseMirror which has the best document model of any web editor. Its extension system means I can add features as plugins without touching the core editor. The keyboard shortcuts work out of the box.

### Why PostgreSQL instead of SQLite

I started with SQLite because it needs zero setup. But when I tried to deploy on Vercel, the filesystem is read-only and SQLite can't write. I spent 30 minutes trying to work around it before switching to Railway with PostgreSQL. Prisma makes the switch trivial — change one line in the schema file.

### Why cookies instead of JWT

The assignment says I can use "seeded accounts, mocked auth, or a lightweight login flow." I chose seeded accounts with a simple httpOnly cookie. JWTs need secret keys, token refresh logic, and middleware. For three test accounts with no passwords, that's overengineering. The cookie approach is 20 lines of code.

### Why JSON instead of HTML for storing documents

Tiptap natively outputs JSON. I could convert it to HTML but JSON preserves the exact document structure. HTML is just a string that could break if I parse it wrong. JSON also avoids stored XSS because I never render raw HTML.

### Why auto-save with 1000ms debounce

Every modern editor auto-saves. The debounce means I wait 1 second after the user stops typing before hitting the database. Without debounce, every keystroke would be an API call.

## The Hardest Bug

The editor re-render loop. User types, Tiptap fires onUpdate, I update React state, React re-renders the editor, Tiptap re-initializes, cursor jumps to start. Typing felt laggy. Bold and italic buttons didn't work because clicking them stole focus from the editor.

I spent 45 minutes on this. What actually worked: useRef for initial content (parse once, never again), onUpdateRef pattern for callbacks (store callback in a ref so it updates without re-creating the editor), and onMouseDown preventDefault on toolbar buttons (stops focus theft while still running the command on click).

## Prioritization

1. Editing experience — this is the product
2. Sharing flow — the assignment explicitly asks for it
3. Persistence — documents must survive refresh
4. File upload — practical feature that shows I can handle file I/O

## What I'd Build Next

1. Security hardening — Rate limiting, CSRF tokens, CSP headers
2. Real-time collaboration — Yjs for CRDTs, y-websocket for sync
3. Version history — Snapshot table with timestamps
4. .docx upload — mammoth.js for Word parsing
5. Full-text search — Prisma supports this for PostgreSQL
