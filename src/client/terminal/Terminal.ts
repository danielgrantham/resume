import { History } from "./History.ts";
import { OutputRenderer, type StyledSpan } from "./OutputRenderer.ts";
import { InputHandler } from "./InputHandler.ts";
import { TabComplete } from "./TabComplete.ts";
import type { FileSystem } from "../filesystem/FileSystem.ts";
import type { CommandRegistry } from "../commands/registry.ts";

export class Terminal {
  readonly history = new History();
  readonly renderer: OutputRenderer;
  readonly inputHandler: InputHandler;
  readonly tabComplete = new TabComplete();

  private terminalEl: HTMLDivElement;
  private outputEl: HTMLDivElement;
  private promptLineEl: HTMLDivElement;
  private inputLineEl: HTMLDivElement;
  private dollarEl: HTMLSpanElement;
  private inputTextEl: HTMLSpanElement;
  private cursorEl: HTMLSpanElement;
  private hiddenInput: HTMLInputElement;
  private ghostEl: HTMLDivElement | null = null;

  private fs: FileSystem;
  private registry: CommandRegistry | null = null;
  private ghostDismissed = false;

  constructor(container: HTMLElement, fs: FileSystem) {
    this.fs = fs;

    this.terminalEl = document.createElement("div");
    this.terminalEl.id = "terminal";

    this.outputEl = document.createElement("div");
    this.outputEl.id = "terminal-output";

    this.promptLineEl = document.createElement("div");
    this.promptLineEl.className = "prompt-line";

    this.inputLineEl = document.createElement("div");
    this.inputLineEl.className = "input-line";

    this.dollarEl = document.createElement("span");
    this.dollarEl.className = "prompt-dollar";
    this.dollarEl.textContent = "$";

    this.inputTextEl = document.createElement("span");
    this.inputTextEl.className = "input-text";

    this.cursorEl = document.createElement("span");
    this.cursorEl.className = "cursor";

    this.hiddenInput = document.createElement("input");
    this.hiddenInput.id = "hidden-input";
    this.hiddenInput.type = "text";
    this.hiddenInput.autocapitalize = "none";
    this.hiddenInput.autocomplete = "off";
    this.hiddenInput.spellcheck = false;

    this.inputLineEl.appendChild(this.dollarEl);
    this.inputLineEl.appendChild(this.inputTextEl);
    this.inputLineEl.appendChild(this.cursorEl);

    this.terminalEl.appendChild(this.outputEl);
    this.terminalEl.appendChild(this.promptLineEl);
    this.terminalEl.appendChild(this.inputLineEl);
    this.terminalEl.appendChild(this.hiddenInput);

    container.appendChild(this.terminalEl);

    this.renderer = new OutputRenderer(this.outputEl);

    this.inputHandler = new InputHandler({
      inputEl: this.inputTextEl,
      cursorEl: this.cursorEl,
      hiddenInput: this.hiddenInput,
      history: this.history,
      tabComplete: this.tabComplete,
      renderer: this.renderer,
      fs: this.fs,
      onCommand: (raw) => this.executeCommand(raw),
    });

    this.terminalEl.addEventListener("click", () => this.inputHandler.focus());
    this.renderPrompt();
    this.showGhostText();

    requestAnimationFrame(() => this.inputHandler.focus());
  }

  setRegistry(registry: CommandRegistry): void {
    this.registry = registry;
    this.tabComplete.setCommands(registry.getCommandNames());
  }

  dismissGhostText(): void {
    if (this.ghostEl && !this.ghostDismissed) {
      this.ghostDismissed = true;
      this.ghostEl.remove();
      this.ghostEl = null;
    }
  }

  private renderPrompt(): void {
    this.promptLineEl.innerHTML = "";
    this.promptLineEl.style.display = "";
    this.dollarEl.style.display = "";
    const hasPrevious = !!this.outputEl.querySelector(".prompt-line");
    this.promptLineEl.className = hasPrevious
      ? "prompt-line prompt-spaced"
      : "prompt-line";
    const cwd = this.fs.getCwdDisplay();

    const spans: { text: string; className: string }[] = [
      { text: "user@GRANTHAM-TERMINAL", className: "prompt-user" },
      { text: "BASH", className: "prompt-shell" },
      { text: cwd, className: "prompt-cwd" },
    ];

    for (const s of spans) {
      const el = document.createElement("span");
      el.textContent = s.text;
      el.className = s.className;
      this.promptLineEl.appendChild(el);
    }
  }

  private showGhostText(): void {
    this.ghostEl = document.createElement("div");
    this.ghostEl.className = "ghost-text";
    this.ghostEl.textContent = "Type `grantham --help` to get started";
    this.outputEl.appendChild(this.ghostEl);
  }

  private async executeCommand(raw: string): Promise<void> {
    if (raw === "\x03") {
      this.freezePromptAndInput("");
      this.renderPrompt();
      return;
    }

    this.freezePromptAndInput(raw);
    this.inputHandler.disable();

    if (raw.trim()) {
      await this.registry?.execute(raw.trim(), this);
    }

    this.renderPrompt();
    this.inputHandler.enable();
    this.inputHandler.setInput("");
    this.scrollToBottom();
    this.inputHandler.focus();
  }

  freezePromptAndInput(inputText: string): void {
    const isFirst = !this.outputEl.querySelector(".prompt-line");
    const promptDiv = document.createElement("div");
    promptDiv.className = isFirst ? "prompt-line" : "prompt-line prompt-spaced";
    promptDiv.innerHTML = this.promptLineEl.innerHTML;
    this.outputEl.appendChild(promptDiv);

    const inputDiv = document.createElement("div");
    inputDiv.className = "input-line";
    const dollar = document.createElement("span");
    dollar.className = "prompt-dollar";
    dollar.textContent = "$";
    inputDiv.appendChild(dollar);
    const inputSpan = document.createElement("span");
    inputSpan.textContent = inputText;
    inputDiv.appendChild(inputSpan);
    this.outputEl.appendChild(inputDiv);
  }

  printError(message: string): void {
    this.renderer.print([{ text: message, className: "ansi-red" }]);
  }

  printSpans(spans: StyledSpan[]): void {
    this.renderer.print(spans);
  }

  async streamSpans(spans: StyledSpan[]): Promise<void> {
    await this.renderer.stream(spans);
  }

  prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.renderer.print([{ text: question }]);
      this.inputHandler.setInput("");
      this.inputHandler.setPromptHandler((value) => {
        this.freezeInputOnly(value);
        this.inputHandler.setPromptHandler(null);
        resolve(value);
      });
    });
  }

  promptInline(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.promptLineEl.style.display = "none";
      this.dollarEl.style.display = "none";

      const label = document.createElement("span");
      label.textContent = question;
      this.inputLineEl.insertBefore(label, this.dollarEl);
      this.inputTextEl.classList.add("inline-prompt");

      this.inputHandler.setInput("");
      this.inputHandler.enable();
      this.scrollToBottom();
      this.inputHandler.focus();

      this.inputHandler.setPromptHandler((value) => {
        const frozenLine = document.createElement("div");
        const frozenLabel = document.createElement("span");
        frozenLabel.textContent = question;
        frozenLine.appendChild(frozenLabel);
        const frozenValue = document.createElement("span");
        frozenValue.textContent = value;
        frozenLine.appendChild(frozenValue);
        this.outputEl.appendChild(frozenLine);

        label.remove();
        this.inputTextEl.classList.remove("inline-prompt");
        this.inputHandler.setPromptHandler(null);
        this.inputHandler.setInput("");
        this.inputHandler.disable();
        resolve(value);
      });
    });
  }

  private freezeInputOnly(text: string): void {
    const div = document.createElement("div");
    div.textContent = text;
    this.outputEl.appendChild(div);
  }

  private scrollToBottom(): void {
    this.terminalEl.scrollTop = this.terminalEl.scrollHeight;
  }
}
