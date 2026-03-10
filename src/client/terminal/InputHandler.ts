import type { History } from "./History.ts";
import type { TabComplete } from "./TabComplete.ts";
import type { OutputRenderer } from "./OutputRenderer.ts";
import type { FileSystem } from "../filesystem/FileSystem.ts";

export type CommandExecutor = (raw: string) => Promise<void>;

export class InputHandler {
  private inputEl: HTMLSpanElement;
  private cursorEl: HTMLSpanElement;
  private hiddenInput: HTMLInputElement;
  private history: History;
  private tabComplete: TabComplete;
  private renderer: OutputRenderer;
  private fs: FileSystem;
  private onCommand: CommandExecutor;
  private onScroll: () => void;
  private currentInput = "";

  private promptHandler: ((value: string) => void) | null = null;

  constructor(opts: {
    inputEl: HTMLSpanElement;
    cursorEl: HTMLSpanElement;
    hiddenInput: HTMLInputElement;
    history: History;
    tabComplete: TabComplete;
    renderer: OutputRenderer;
    fs: FileSystem;
    onCommand: CommandExecutor;
    onScroll: () => void;
  }) {
    this.inputEl = opts.inputEl;
    this.cursorEl = opts.cursorEl;
    this.hiddenInput = opts.hiddenInput;
    this.history = opts.history;
    this.tabComplete = opts.tabComplete;
    this.renderer = opts.renderer;
    this.fs = opts.fs;
    this.onCommand = opts.onCommand;
    this.onScroll = opts.onScroll;

    this.hiddenInput.addEventListener("keydown", this.handleKeyDown);
    this.hiddenInput.addEventListener("input", this.handleInput);
  }

  focus(): void {
    this.hiddenInput.focus({ preventScroll: true });
  }

  setInput(text: string): void {
    this.currentInput = text;
    this.render();
  }

  getInput(): string {
    return this.currentInput;
  }

  setPromptHandler(handler: ((value: string) => void) | null): void {
    this.promptHandler = handler;
  }

  disable(): void {
    this.cursorEl.style.display = "none";
  }

  enable(): void {
    this.cursorEl.style.display = "";
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this.renderer.isStreaming) {
      e.preventDefault();
      return;
    }

    this.onScroll();

    if (e.key === "Enter") {
      e.preventDefault();
      const value = this.currentInput;
      this.currentInput = "";
      this.render();

      if (this.promptHandler) {
        this.promptHandler(value);
      } else {
        this.history.push(value);
        this.onCommand(value);
      }
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      this.currentInput = this.currentInput.slice(0, -1);
      this.render();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (this.promptHandler) return;
      const prev = this.history.prev();
      if (prev !== null) {
        this.currentInput = prev;
        this.render();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (this.promptHandler) return;
      const next = this.history.next();
      this.currentInput = next ?? "";
      this.render();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      if (this.promptHandler) return;
      const result = this.tabComplete.complete(this.currentInput, this.fs);
      if (result.options) {
        this.renderer.print([{ text: result.options.join("  ") }]);
      }
      this.currentInput = result.completed;
      this.render();
      return;
    }

    if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      if (this.promptHandler) {
        this.promptHandler("\x03");
        return;
      }
      this.renderer.print([{ text: this.currentInput + "^C" }]);
      this.currentInput = "";
      this.render();
      this.onCommand("\x03");
      return;
    }

    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      this.renderer.clear();
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      this.currentInput += e.key;
      this.render();
      return;
    }
  };

  private handleInput = (): void => {
    if (this.renderer.isStreaming) {
      this.hiddenInput.value = "";
      return;
    }
    this.onScroll();
    const value = this.hiddenInput.value;
    if (value) {
      this.currentInput += value;
      this.hiddenInput.value = "";
      this.render();
    }
  };

  private render(): void {
    this.inputEl.textContent = this.currentInput;
  }
}
