# Submission — Ojaswa Mohan Srivastava

**Email:** ojaswag5@gmail.com

## What's Included

- Source code: https://github.com/shauryaojaswa/ajaia-docs
- Live deployment: https://web-production-787ce.up.railway.app/
- README.md with setup and run instructions
- architecture.md with technical decisions and tradeoffs
- ai-workflow.md with how I used AI tools and what I changed
- Automated tests in __tests__/markdown-parser.test.ts (6 tests, all passing)
- Walkthrough video: recording within 24 hours

## What's Working End-to-End

- Document creation and editing
- Rich text: bold, italic, underline, strikethrough, highlight, H1/H2/H3, bullet lists, numbered lists, blockquote, code block, text alignment
- Auto-save with visual status indicator
- Document renaming
- File upload (.txt and .md) with markdown parsing
- Document sharing with view/edit permissions
- Owned vs shared document distinction
- User switching for testing share flows
- Full persistence across page refreshes
- API authorization on all routes
- 6 automated tests

## What's Incomplete

- Real-time collaboration — Cut because it needs CRDTs and WebSockets
- .docx upload — Cut because mammoth.js breaks on complex docs
- Version history — Would need snapshot storage and diff viewer
- PDF/Markdown export — Not in requirements
- Security hardening — Rate limiting, CSRF, CSP headers missing. Planning to add.

## What I'd Build With 2-4 More Hours

1. Security hardening (rate limiting, CSRF, CSP headers)
2. Real-time collaboration using Yjs + WebSockets
3. Document version history with rollback
4. .docx import via mammoth.js
5. Full-text search across documents

## Test Accounts

| Name | Email |
|------|-------|
| Ojaswa Srivastava | ojaswa@ajaia.ai |
| Shaurya | shaurya@ajaia.ai |
| Assistant Ojaswa | assistant@ajaia.ai |

No passwords. Click to log in.

## How to Run Locally

```bash
git clone https://github.com/shauryaojaswa/ajaia-docs.git
cd ajaia-docs
npm install
npx prisma db push
npx prisma db seed
npm run dev
