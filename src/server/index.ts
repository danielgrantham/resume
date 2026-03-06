import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import hireRoutes from "./routes/hire.ts";
import nodePath from "node:path";
import nodeFs from "node:fs";

const app = new Hono();

const CONTENT_DIR = nodePath.resolve(import.meta.dir, "../content");
const CLIENT_DIR = nodePath.resolve(import.meta.dir, "../client");
const ROOT_DIR = nodePath.resolve(import.meta.dir, "../..");
const ALLOWED_CONTENT = [
  "about.md",
  "experience.md",
  "skills.md",
  "contact.md",
];

async function buildClient(): Promise<void> {
  const entrypoint = nodePath.join(CLIENT_DIR, "main.ts");
  const outdir = nodePath.join(ROOT_DIR, "dist");
  await Bun.build({
    entrypoints: [entrypoint],
    outdir,
    minify: false,
    target: "browser",
    format: "esm",
  });

  const cssSource = nodePath.join(CLIENT_DIR, "styles", "main.css");
  const cssDest = nodePath.join(outdir, "main.css");
  nodeFs.copyFileSync(cssSource, cssDest);
}

await buildClient();

app.route("/api/hire", hireRoutes);

app.get("/content/:filename", (c) => {
  const filename = c.req.param("filename");
  if (!ALLOWED_CONTENT.includes(filename)) {
    return c.json({ error: "Not found" }, 404);
  }

  const filePath = nodePath.join(CONTENT_DIR, filename);
  try {
    const content = nodeFs.readFileSync(filePath, "utf-8");
    return c.text(content);
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

app.get("/api/resume", (c) => {
  const filePath = nodePath.join(ROOT_DIR, "public", "resume.pdf");
  try {
    const data = nodeFs.readFileSync(filePath);
    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Daniel_Grantham_Resume.pdf"',
      },
    });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

app.use("/dist/*", serveStatic({ root: "./" }));
app.use("/public/*", serveStatic({ root: "./" }));

app.get("*", (c) => {
  const htmlPath = nodePath.join(CLIENT_DIR, "index.html");
  const html = nodeFs.readFileSync(htmlPath, "utf-8");
  return c.html(html);
});

const port = parseInt(process.env["PORT"] ?? "3000", 10);

export default {
  port,
  fetch: app.fetch,
};

console.log(`Server running at http://localhost:${port}`);
