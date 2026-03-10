# Personal Terminal Website — Requirements Document

## 1. Project Overview

A single-page application (SPA) personal website for Daniel Grantham that presents itself as an interactive terminal emulator. Visitors interact with the site exclusively through a simulated bash terminal, exploring content via familiar command-line commands. The site serves as a portfolio, resume, and contact mechanism.

### 1.1 Core Principles

- **No scrolling on the page itself** — the terminal scrolls internally; the page viewport is static on both desktop and mobile.
- **Dark, minimal aesthetic** — black background with a contrasting terminal panel using the "One Half Dark" color theme.
- **Terminal-first interaction** — all content is accessed through typed commands; there are no buttons, nav bars, or traditional UI elements.

---

## 2. Tech Stack

| Layer                | Technology                                                                     |
| -------------------- | ------------------------------------------------------------------------------ |
| Language             | TypeScript (strict mode)                                                       |
| Frontend Framework   | Vanilla TypeScript (no framework)                                              |
| Build Tool / Runtime | Bun                                                                            |
| Backend Runtime      | Bun                                                                            |
| Backend Framework    | Hono (lightweight, runs natively on Bun)                                       |
| Database             | SQLite (via `bun:sqlite`)                                                      |
| Email Service        | Resend (developer-friendly API, generous free tier)                            |
| Font                 | Cascadia Code (served via CDN or self-hosted)                                  |
| Deployment           | TBD — must support a persistent Bun process (VPS, Railway, Fly.io, or similar) |
| CI/CD                | GitHub Actions — push to `main` triggers build and deploy                      |

### 2.1 Project Structure (Actual)

```
grantham-terminal/
├── src/
│   ├── client/                 # Frontend SPA
│   │   ├── index.html
│   │   ├── main.ts             # Entry point
│   │   ├── terminal/
│   │   │   ├── Terminal.ts     # Terminal UI component
│   │   │   ├── InputHandler.ts # Keyboard/input management
│   │   │   ├── OutputRenderer.ts # Streaming text renderer
│   │   │   ├── History.ts      # Command history (up/down)
│   │   │   └── TabComplete.ts  # Tab completion engine
│   │   ├── filesystem/
│   │   │   ├── FileSystem.ts   # Virtual filesystem tree
│   │   │   └── types.ts        # File/directory types
│   │   ├── commands/
│   │   │   ├── registry.ts     # Command registry
│   │   │   ├── bash/           # Standard bash commands
│   │   │   │   ├── ls.ts
│   │   │   │   ├── cat.ts
│   │   │   │   ├── cd.ts
│   │   │   │   ├── pwd.ts
│   │   │   │   ├── clear.ts
│   │   │   │   ├── echo.ts
│   │   │   │   ├── whoami.ts
│   │   │   │   ├── history.ts
│   │   │   │   ├── help.ts
│   │   │   │   ├── man.ts
│   │   │   │   └── rm.ts       # Easter egg handler
│   │   │   └── grantham/
│   │   │       ├── index.ts    # Flag router
│   │   │       ├── help.ts
│   │   │       ├── about.ts
│   │   │       ├── experience.ts
│   │   │       ├── projects.ts
│   │   │       ├── skills.ts
│   │   │       ├── education.ts
│   │   │       ├── contact.ts
│   │   │       ├── resume.ts
│   │   │       └── hire.ts     # Interactive hire flow
│   │   └── styles/
│   │       └── main.css
│   ├── server/                 # Backend API
│   │   ├── index.ts            # Hono app entry
│   │   ├── db.ts               # SQLite setup and queries
│   │   ├── routes/
│   │   │   └── hire.ts         # POST /api/hire
│   │   └── email.ts            # Resend integration
│   └── content/                # Markdown content files
│       ├── about.md
│       ├── experience.md
│       ├── projects.md
│       ├── skills.md
│       ├── education.md
│       └── contact.md
├── public/
│   ├── avatar.jpg              # Circular-cropped avatar
│   └── resume.pdf              # Downloadable resume
├── bunfig.toml
├── tsconfig.json
├── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

---

## 3. Layout & Responsive Design

### 3.1 Desktop Layout (≥ 768px)

```
┌──────────────────────────────────────────────────────────┐
│ (black background)                                       │
│                                                          │
│   ┌──────────┐  ┌────────────────────────────────────┐   │
│   │          │  │                                    │   │
│   │  AVATAR  │  │                                    │   │
│   │ (circle) │  │          TERMINAL                  │   │
│   │          │  │                                    │   │
│   ├──────────┤  │                                    │   │
│   │  Daniel  │  │                                    │   │
│   │ Grantham │  │                                    │   │
│   │ Software │  │                                    │   │
│   │Developer │  │                                    │   │
│   │email@addr│  │                                    │   │
│   └──────────┘  │                                    │   │
│                 │ user@grantham.terminal bash ~$      │   │
│                 │ █                                   │   │
│                 │                                    │   │
│                 │ Type `grantham --help` to start    │   │
│                 └────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Terminal occupies approximately **two-thirds** of the viewport width.
- Avatar and identity panel sit to the **left** of the terminal.
- Standard margins (e.g., 24–32px) separate the terminal from the viewport edges.
- Avatar and info are vertically centered relative to the terminal.

### 3.2 Mobile Layout (< 768px)

```
┌──────────────────────┐
│                      │
│       (AVATAR)       │
│    Daniel Grantham   │
│   Software Developer │
│     email@address    │
│                      │
│ ┌──────────────────┐ │
│ │                  │ │
│ │    TERMINAL      │ │
│ │                  │ │
│ │                  │ │
│ │                  │ │
│ │ user@...bash ~$  │ │
│ │ █                │ │
│ │                  │ │
│ │ Type `grantham   │ │
│ │ --help` to start │ │
│ └──────────────────┘ │
└──────────────────────┘
```

- Avatar is **centered above** the terminal.
- Terminal spans **edge to edge** horizontally (no horizontal margins).
- Terminal fills from the **bottom of the avatar/info section to the bottom of the screen** with standard vertical margins.
- Font size stays the same; text **wraps** to fit narrower columns.
- Native keyboard is used for input (no custom on-screen keyboard).

---

## 4. Visual Design

### 4.1 Color Theme — "One Half Dark"

| Token                     | Hex       | Usage                                 |
| ------------------------- | --------- | ------------------------------------- |
| Page background           | `#000000` | Body background (pure black)          |
| Terminal background       | `#282c34` | Terminal panel background             |
| Foreground (default text) | `#dcdfe4` | Standard output, prompt text          |
| Black (ANSI 0)            | `#282c34` | —                                     |
| Red (ANSI 1)              | `#e06c75` | Errors, `command not found`           |
| Green (ANSI 2)            | `#98c379` | Success messages, directories in `ls` |
| Yellow (ANSI 3)           | `#e5c07b` | Warnings, flags in help output        |
| Blue (ANSI 4)             | `#61afef` | Prompt user/host, links               |
| Magenta (ANSI 5)          | `#c678dd` | Command names in help                 |
| Cyan (ANSI 6)             | `#56b6c2` | Paths, filenames                      |
| White (ANSI 7)            | `#dcdfe4` | —                                     |

### 4.2 Typography

- **Font family:** `Cascadia Code`, falling back to `Consolas`, `monospace`.
- **Ligatures:** Enabled.
- **Font size:** 14–15px (consistent across breakpoints).
- **Line height:** ~1.4–1.5 for readable terminal output.

### 4.3 Terminal Chrome

- **No window controls** (no title bar, no minimize/maximize/close buttons).
- The terminal is a borderless rectangular panel distinguished from the page solely by its `#282c34` background against the `#000000` page background.
- Optional: subtle border-radius (2–4px) on corners for polish.

### 4.4 Avatar

- **Circular crop** (CSS `border-radius: 50%`).
- Sized approximately 120–150px diameter on desktop, ~100px on mobile.
- Image file: `public/avatar.jpg`.

### 4.5 Identity Panel (Below Avatar)

- **Name:** "Daniel Grantham" — white, slightly larger or bold.
- **Title:** "Software Developer" — muted/gray color.
- **Email:** Displayed as a clickable `mailto:` link, muted blue (`#61afef`).

### 4.6 Favicon

- Custom favicon using initials **"DG"** in monospace font on a dark background.
- Provide as both `.ico` and `.svg` formats.

---

## 5. Terminal Behavior

### 5.1 Prompt

```
user@grantham.terminal bash ~$
█
```

- **Line 1:** Identifying string — `user@grantham.terminal bash <current-working-directory>$`
  - `user@grantham.terminal` in blue (`#61afef`).
  - `bash` in default foreground.
  - Current working directory in cyan (`#56b6c2`), updates with `cd`.
  - `$` in default foreground.
- **Line 2:** Blinking cursor (`|` block cursor) on the input line.
- The prompt updates the working directory segment when the user `cd`s to a different location.

### 5.2 Input

- Standard text input captured at the cursor position.
- **Backspace** deletes the character before the cursor.
- **Enter** executes the current input as a command.
- **Up arrow** cycles backward through command history.
- **Down arrow** cycles forward through command history; at the end of history, clears the input field.
- **Tab** triggers autocomplete for commands and filenames in the current directory.
- **Ctrl+C** cancels the current input line and prints a new prompt.
- **Ctrl+L** clears the terminal (equivalent to `clear`).
- Focus is always on the terminal input; clicking anywhere on the terminal should re-focus input.

### 5.3 Output Rendering

- Command output is **streamed character-by-character** with a near-instant speed (target: ~5–15ms per character, tunable).
- During streaming, input is **disabled** (queued keystrokes are ignored or buffered).
- After streaming completes, a new prompt appears and input is re-enabled.
- **Clickable links:** Any URLs in output (e.g., GitHub links, LinkedIn) render as clickable hyperlinks styled in blue (`#61afef`) with underline on hover.

### 5.4 Internal Scrolling

- The terminal panel has `overflow-y: auto` (or hidden with JS-managed scroll).
- Output that exceeds the visible area scrolls the terminal content upward.
- New output and the prompt are always scrolled into view.
- The page itself never scrolls.

### 5.5 Ghost Text / Helper

- On first load, **before any command has been entered**, a ghost text hint appears at the bottom of the terminal:

  ```
  Type `grantham --help` to get started
  ```

- Styled in a muted/dim color (e.g., `#5c6370` or 50% opacity foreground).
- This hint **disappears permanently** once the `man grantham` or `grantham --help` command has been executed (tracked in session state).

---

## 6. Simulated Filesystem

### 6.1 Directory Structure (Virtual)

The virtual filesystem mirrors the real `src/content/` structure and adds logical groupings:

```
/home/user/
├── about.md
├── experience.md
├── skills.md
├── education.md
├── contact.md
├── resume.pdf
└── projects/
    ├── project-1.md
    ├── project-2.md
    └── ...
```

- **Home directory:** `/home/user/` aliased as `~`.
- The filesystem is **read-only**; write commands (e.g., `touch`, `mkdir`, `nano`) return `permission denied` or `command not found`.
- File contents are loaded from external markdown files at `/content/*.md` via fetch at startup or on demand.

### 6.2 Navigation

- `cd <dir>` changes the current directory; prompt updates accordingly.
- `cd ..` moves up one level.
- `cd ~` or `cd` with no args returns to home.
- `cd` into a non-existent directory returns: `bash: cd: <dir>: No such file or directory`.
- `ls` lists files and directories in the current directory.
  - Directories shown in green (`#98c379`).
  - Markdown files shown in default foreground.
  - `resume.pdf` shown in default foreground.

---

## 7. Commands

### 7.1 Bash Commands

| Command        | Behavior                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `ls`           | Lists contents of the current directory. Directories in green, files in default color.                    |
| `ls <path>`    | Lists contents of the specified directory.                                                                |
| `cat <file>`   | Streams the contents of the specified file to the terminal.                                               |
| `cd <dir>`     | Changes current working directory.                                                                        |
| `cd` / `cd ~`  | Returns to home directory (`~`).                                                                          |
| `pwd`          | Prints the current working directory (e.g., `/home/user`).                                                |
| `clear`        | Clears all terminal output. Resets view to an empty terminal with a fresh prompt.                         |
| `echo <text>`  | Prints the provided text to the terminal.                                                                 |
| `whoami`       | Prints `Daniel Grantham`.                                                                                 |
| `history`      | Prints a numbered list of all commands entered in the session.                                            |
| `help`         | Prints a list of all available commands with brief descriptions.                                          |
| `man grantham` | Alias for `grantham --help`.                                                                              |
| `rm -rf /`     | Prints `Good try.` — Easter egg. Any other `rm` usage returns `command not found` or `permission denied`. |

### 7.2 The `grantham` Command

The primary custom command. Invoked with flags.

```
Usage: grantham [OPTIONS]

Options:
  -h, --help          Show this help message
  -a, --about         Display bio and summary
  -x, --experience    Display professional experience
  -p, --projects      Display project portfolio
  -s, --skills        Display technical skills
  -e, --education     Display education history
  -c, --contact       Display contact information
  -r, --resume        Download resume as PDF
      --hire          Start the hire inquiry flow
```

#### 7.2.1 `grantham --help` / `grantham -h`

- Prints the usage block above.
- Dismisses the ghost helper text (if still visible).

#### 7.2.2 `grantham --about` / `grantham -a`

- Streams the contents of `about.md` to the terminal.

#### 7.2.3 `grantham --experience` / `grantham -x`

- Streams the contents of `experience.md` formatted as a chronological resume:

```
EXPERIENCE
══════════

Senior Software Developer
Acme Corp | Jan 2023 – Present
────────────────────────────────
  • Led migration of monolithic architecture to microservices
  • Reduced API response times by 40%
  • Mentored team of 4 junior developers

Software Developer
Widgets Inc | Jun 2020 – Dec 2022
────────────────────────────────
  • Built real-time data pipeline processing 10M events/day
  • Designed and implemented REST API serving 500 RPM
```

#### 7.2.4 `grantham --projects` / `grantham -p`

- Streams the contents of `projects.md` — list of projects with name, description, tech stack, and a clickable link.

#### 7.2.5 `grantham --skills` / `grantham -s`

- Streams the contents of `skills.md` — categorized technical skills (e.g., Languages, Frameworks, Tools, etc.).

#### 7.2.6 `grantham --education` / `grantham -e`

- Streams the contents of `education.md` — degree(s), institution(s), dates.

#### 7.2.7 `grantham --contact` / `grantham -c`

- Streams the contents of `contact.md` — email, LinkedIn, GitHub, etc. as clickable links.

#### 7.2.8 `grantham --resume` / `grantham -r`

Interactive prompt flow:

```
user@grantham.terminal bash ~$
grantham --resume

Download resume? [Y/n]: █
```

- Default is **yes** (`Y` is capitalized).
- Pressing **Enter** or typing `y`/`Y` triggers a browser file download of `resume.pdf`.
- Typing `n`/`N` cancels and prints `Download cancelled.`
- Any other input re-prompts.

#### 7.2.9 `grantham --hire`

Interactive prompt flow:

```
user@grantham.terminal bash ~$
grantham --hire

Company: █
```

After entering a company name:

```
Company: Acme Corp
Contact Email: █
```

**Email validation:**

- If the entered email fails basic format validation (`name@domain.tld`), print:
  ```
  Invalid email format. Please try again.
  Contact Email: █
  ```

After a valid email:

```
Company: Acme Corp
Contact Email: jane@acme.com

Daniel will contact you ASAP to follow up.
```

**Backend behavior:**

1. `POST /api/hire` with `{ company, email }`.
2. Server validates the email format again server-side.
3. Server checks rate limit (e.g., max 3 submissions per IP per hour).
4. If rate-limited, respond with `429` and print: `Too many requests. Please try again later.`
5. On success:
   - Insert record into SQLite: `hire_inquiries` table with columns `id`, `company`, `email`, `ip`, `created_at`.
   - Send notification email to Daniel via Resend.
   - Return `200`.

### 7.3 Error Handling

| Scenario                           | Response                                                    |
| ---------------------------------- | ----------------------------------------------------------- |
| Unknown command                    | `bash: <command>: command not found` (red text)             |
| Command chaining (`\|`, `&&`, `;`) | `Command chaining is not supported.`                        |
| `cat` with no file argument        | `cat: missing file operand`                                 |
| `cat` on nonexistent file          | `cat: <file>: No such file or directory`                    |
| `cd` to nonexistent directory      | `bash: cd: <dir>: No such file or directory`                |
| `cat` on a directory               | `cat: <dir>: Is a directory`                                |
| `cd` into a file                   | `bash: cd: <file>: Not a directory`                         |
| `grantham` with unknown flag       | `grantham: unknown option '<flag>'. Try 'grantham --help'.` |
| `grantham` with no flags           | Same as `grantham --help`.                                  |
| Network error on `--hire`          | `Error: Unable to reach server. Please try again.`          |

---

## 8. Tab Completion

- **Commands:** Pressing Tab with a partial command typed autocompletes to the matching command (e.g., `cle` → `clear`).
- **Filenames:** After `cat ` or `cd `, Tab autocompletes filenames/directories in the current directory.
- **Grantham flags:** After `grantham -`, Tab cycles through available flags.
- **Ambiguous matches:** If multiple matches exist, pressing Tab twice lists all options (bash-style).
- **No match:** Tab does nothing.

---

## 9. Command History

- All successfully entered commands are stored in a session-scoped list.
- **Up arrow** replaces the current input with the previous command in history.
- **Down arrow** moves forward through history. Past the most recent command, the input field clears.
- **`history` command** prints a numbered list:
  ```
      1  grantham --help
      2  ls
      3  cat about.md
      4  grantham --experience
  ```
- History is **not persisted** across page reloads.

---

## 10. Content Management

### 10.1 Content Source

- All content displayed by `grantham` subcommands and `cat` is loaded from **external Markdown files** located in `src/content/`.
- Markdown is parsed and rendered as styled terminal output (not raw HTML).
- Content can be updated by editing the `.md` files without changing application code.

### 10.2 Content Files

| File            | Used By                                        |
| --------------- | ---------------------------------------------- |
| `about.md`      | `grantham --about`, `cat about.md`             |
| `experience.md` | `grantham --experience`, `cat experience.md`   |
| `projects.md`   | `grantham --projects`, `cat projects/` listing |
| `skills.md`     | `grantham --skills`, `cat skills.md`           |
| `education.md`  | `grantham --education`, `cat education.md`     |
| `contact.md`    | `grantham --contact`, `cat contact.md`         |

### 10.3 Markdown Rendering in Terminal

Markdown is converted to terminal-styled output:

| Markdown Element | Terminal Rendering                                     |
| ---------------- | ------------------------------------------------------ |
| `# Heading`      | UPPERCASE, bold, underlined with `═` characters        |
| `## Subheading`  | Bold, underlined with `─` characters                   |
| `- bullet`       | `  • bullet` (indented with bullet character)          |
| `**bold**`       | Bold (CSS `font-weight: bold`)                         |
| `[text](url)`    | Clickable link in blue (`#61afef`), underline on hover |
| `` `code` ``     | Highlighted in yellow (`#e5c07b`)                      |
| Paragraphs       | Separated by a blank line                              |

---

## 11. Backend API

### 11.1 Endpoints

| Method | Path                 | Description                      |
| ------ | -------------------- | -------------------------------- |
| `POST` | `/api/hire`          | Submit a hire inquiry            |
| `GET`  | `/content/:filename` | Retrieve a markdown content file |

### 11.2 `POST /api/hire`

**Request body:**

```json
{
	"company": "string (required, 1–200 chars)",
	"email": "string (required, valid email format)"
}
```

**Responses:**

| Status | Body                                      | Condition                     |
| ------ | ----------------------------------------- | ----------------------------- |
| `200`  | `{ "success": true }`                     | Inquiry stored and email sent |
| `400`  | `{ "error": "Invalid email format" }`     | Email validation failed       |
| `400`  | `{ "error": "Company name is required" }` | Missing company               |
| `429`  | `{ "error": "Rate limit exceeded" }`      | > 3 requests/IP/hour          |
| `500`  | `{ "error": "Internal server error" }`    | Unexpected failure            |

### 11.3 Database Schema

```sql
CREATE TABLE IF NOT EXISTS hire_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    ip TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    email_sent INTEGER NOT NULL DEFAULT 0
);
```

### 11.4 Email Notification

On successful hire inquiry submission, send an email to Daniel via **Resend**:

- **To:** Daniel's configured email address (environment variable).
- **Subject:** `New Hire Inquiry from <company>`
- **Body:** Contains company name, contact email, timestamp, and submitter IP.

### 11.5 Rate Limiting

- **Limit:** 3 submissions per IP address per rolling 60-minute window.
- Checked via SQL query against `hire_inquiries` table (`WHERE ip = ? AND created_at > datetime('now', '-1 hour')`).
- Returns `429` status if exceeded.

---

## 12. Meta Tags & Social Sharing

Although SEO is not a priority, the following meta tags should be present for good link previews when the URL is shared:

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="Daniel Grantham — Software Developer" />

<!-- Open Graph -->
<meta property="og:title" content="Daniel Grantham — Software Developer" />
<meta property="og:description" content="Interactive terminal-style personal website" />
<meta property="og:image" content="/og-image.png" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://<domain>" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Daniel Grantham — Software Developer" />
<meta name="twitter:description" content="Interactive terminal-style personal website" />
<meta name="twitter:image" content="/og-image.png" />
```

- An **Open Graph image** (`og-image.png`, 1200×630px) should be created — a screenshot or stylized rendering of the terminal with some sample output.

---

## 13. Easter Eggs

| Trigger                         | Response                                                  |
| ------------------------------- | --------------------------------------------------------- |
| `rm -rf /`                      | `Good try.`                                               |
| `rm -rf` (any variant with `/`) | `Good try.`                                               |
| `rm` (anything else)            | `rm: command not supported`                               |
| `sudo <anything>`               | `bash: sudo: command not found` (or `Permission denied.`) |

Additional Easter eggs may be added in future iterations.

---

## 14. Environment Variables

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
NOTIFICATION_EMAIL=daniel@example.com
DATABASE_PATH=./data/grantham.db
PORT=3000
```

---

## 15. Performance Requirements

| Metric                     | Target                |
| -------------------------- | --------------------- |
| Initial page load (LCP)    | < 1.5s                |
| Time to interactive        | < 2s                  |
| Content file fetch         | < 200ms               |
| Hire submission round-trip | < 500ms               |
| Character stream interval  | 5–15ms (configurable) |

---

## 16. Browser Support

| Browser             | Minimum Version |
| ------------------- | --------------- |
| Chrome              | 90+             |
| Firefox             | 90+             |
| Safari              | 15+             |
| Edge                | 90+             |
| Mobile Safari (iOS) | 15+             |
| Chrome for Android  | 90+             |

---

## 17. Future Considerations (Out of Scope for v1)

These are documented for potential future iterations but are **not** part of the initial build:

- Persistent command history across sessions (localStorage).
- Themes / color scheme switcher.
- Additional Easter eggs (Matrix rain, `cowsay`, `sl`, etc.).
- Blog system (markdown files rendered via `cat posts/<slug>.md`).
- Analytics integration.
- Accessibility-focused alternative view.
- Internationalization (i18n).
