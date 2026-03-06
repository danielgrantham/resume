export interface StyledSpan {
  text: string;
  className?: string;
  href?: string;
  bold?: boolean;
}

export class OutputRenderer {
  private outputEl: HTMLElement;
  private streaming = false;
  private streamSpeed = 30;

  constructor(outputEl: HTMLElement) {
    this.outputEl = outputEl;
  }

  get isStreaming(): boolean {
    return this.streaming;
  }

  setSpeed(ms: number): void {
    this.streamSpeed = ms;
  }

  print(spans: StyledSpan[]): void {
    const line = this.createLine(spans);
    this.outputEl.appendChild(line);
    this.scrollToBottom();
  }

  printRaw(html: HTMLElement): void {
    this.outputEl.appendChild(html);
    this.scrollToBottom();
  }

  async stream(spans: StyledSpan[], speed?: number): Promise<void> {
    this.streaming = true;
    const interval = speed ?? this.streamSpeed;
    const lines = this.splitIntoLines(spans);
    const container = document.createElement("div");
    this.outputEl.appendChild(container);

    for (let i = 0; i < lines.length; i++) {
      const lineDiv = document.createElement("div");
      const lineSpans = lines[i]!;
      if (lineSpans.length === 0) {
        lineDiv.appendChild(document.createTextNode("\u200b"));
      } else {
        for (const span of lineSpans) {
          lineDiv.appendChild(this.createSpanElement(span));
        }
      }
      container.appendChild(lineDiv);
      this.scrollToBottom();

      if (interval > 0 && i < lines.length - 1) {
        await this.delay(interval);
      }
    }

    this.streaming = false;
  }

  private splitIntoLines(spans: StyledSpan[]): StyledSpan[][] {
    const lines: StyledSpan[][] = [];
    let current: StyledSpan[] = [];

    for (const span of spans) {
      const parts = span.text.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          lines.push(current);
          current = [];
        }
        const text = parts[i]!;
        if (text.length > 0) {
          current.push({ ...span, text });
        }
      }
    }

    if (current.length > 0 || lines.length === 0) {
      lines.push(current);
    }

    return lines;
  }

  clear(): void {
    this.outputEl.innerHTML = "";
  }

  private createLine(spans: StyledSpan[]): HTMLDivElement {
    const div = document.createElement("div");
    for (const span of spans) {
      div.appendChild(this.createSpanElement(span));
    }
    return div;
  }

  private createSpanElement(span: StyledSpan): HTMLElement {
    if (span.href) {
      const a = document.createElement("a");
      a.href = span.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "terminal-link";
      a.textContent = span.text;
      return a;
    }

    const el = document.createElement("span");
    el.textContent = span.text;
    const classes: string[] = [];
    if (span.className) classes.push(span.className);
    if (span.bold) classes.push("ansi-bold");
    if (classes.length) el.className = classes.join(" ");
    return el;
  }

  private scrollToBottom(): void {
    const terminal = this.outputEl.parentElement;
    if (terminal) {
      terminal.scrollTop = terminal.scrollHeight;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
