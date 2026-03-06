import type { FileNode, DirEntry } from "./types.ts";

function createTree(): FileNode {
  return {
    name: "/",
    type: "directory",
    children: [
      {
        name: "home",
        type: "directory",
        children: [
          {
            name: "user",
            type: "directory",
            children: [
              { name: "about.md", type: "file", contentUrl: "/content/about.md" },
              { name: "experience.md", type: "file", contentUrl: "/content/experience.md" },
              { name: "skills.md", type: "file", contentUrl: "/content/skills.md" },
              { name: "contact.md", type: "file", contentUrl: "/content/contact.md" },
              { name: "resume.pdf", type: "file" },
            ],
          },
        ],
      },
    ],
  };
}

export class FileSystem {
  private root: FileNode;
  private cwdPath: string[];

  constructor() {
    this.root = createTree();
    this.cwdPath = ["home", "user"];
  }

  getCwd(): string {
    return "/" + this.cwdPath.join("/");
  }

  getCwdDisplay(): string {
    const cwd = this.getCwd();
    if (cwd === "/home/user") return "~";
    if (cwd.startsWith("/home/user/")) return "~" + cwd.slice("/home/user".length);
    return cwd;
  }

  pwd(): string {
    return this.getCwd();
  }

  listCurrentDir(): DirEntry[] {
    const node = this.resolveNode(this.cwdPath);
    if (!node || node.type !== "directory" || !node.children) return [];
    return node.children.map((c) => ({ name: c.name, type: c.type }));
  }

  ls(path?: string): { entries: DirEntry[] } | { error: string } {
    const node = this.resolveFromCwd(path);
    if (!node) {
      return { error: `ls: cannot access '${path}': No such file or directory` };
    }
    if (node.type !== "directory") {
      return { entries: [{ name: node.name, type: node.type }] };
    }
    if (!node.children) return { entries: [] };
    return {
      entries: node.children.map((c) => ({ name: c.name, type: c.type })),
    };
  }

  cd(path?: string): { error?: string } {
    if (!path || path === "~") {
      this.cwdPath = ["home", "user"];
      return {};
    }
    if (path === "..") {
      if (this.cwdPath.length > 0) {
        this.cwdPath.pop();
      }
      return {};
    }
    if (path.startsWith("~/")) {
      path = "/home/user/" + path.slice(2);
    }

    const targetSegments = this.resolveSegments(path);
    const node = this.resolveNode(targetSegments);

    if (!node) {
      return { error: `bash: cd: ${path}: No such file or directory` };
    }
    if (node.type !== "directory") {
      return { error: `bash: cd: ${path}: Not a directory` };
    }

    this.cwdPath = targetSegments;
    return {};
  }

  async cat(path: string): Promise<{ content: string } | { error: string }> {
    const node = this.resolveFromCwd(path);
    if (!node) {
      return { error: `cat: ${path}: No such file or directory` };
    }
    if (node.type === "directory") {
      return { error: `cat: ${path}: Is a directory` };
    }
    if (!node.contentUrl) {
      return { error: `cat: ${path}: Permission denied` };
    }
    if (node.cachedContent !== undefined) {
      return { content: node.cachedContent };
    }
    try {
      const resp = await fetch(node.contentUrl);
      if (!resp.ok) throw new Error("fetch failed");
      const text = await resp.text();
      node.cachedContent = text;
      return { content: text };
    } catch {
      return { error: `cat: ${path}: Unable to read file` };
    }
  }

  async fetchContent(contentFile: string): Promise<string | null> {
    const url = `/content/${contentFile}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      return await resp.text();
    } catch {
      return null;
    }
  }

  private resolveFromCwd(path?: string): FileNode | null {
    if (!path) return this.resolveNode(this.cwdPath);
    const segments = this.resolveSegments(path);
    return this.resolveNode(segments);
  }

  private resolveSegments(path: string): string[] {
    if (path.startsWith("/")) {
      return path.split("/").filter(Boolean);
    }
    if (path.startsWith("~/")) {
      return ["home", "user", ...path.slice(2).split("/").filter(Boolean)];
    }

    const segments = [...this.cwdPath];
    const parts = path.split("/").filter(Boolean);
    for (const part of parts) {
      if (part === "..") {
        if (segments.length > 0) segments.pop();
      } else if (part !== ".") {
        segments.push(part);
      }
    }
    return segments;
  }

  private resolveNode(segments: string[]): FileNode | null {
    let current: FileNode = this.root;
    for (const seg of segments) {
      if (current.type !== "directory" || !current.children) return null;
      const child = current.children.find((c) => c.name === seg);
      if (!child) return null;
      current = child;
    }
    return current;
  }
}
