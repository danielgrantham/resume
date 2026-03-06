export class History {
  private entries: string[] = [];
  private cursor = -1;

  push(command: string): void {
    if (command.trim()) {
      this.entries.push(command);
    }
    this.cursor = this.entries.length;
  }

  prev(): string | null {
    if (this.cursor > 0) {
      this.cursor--;
      return this.entries[this.cursor] ?? null;
    }
    return this.entries[0] ?? null;
  }

  next(): string | null {
    if (this.cursor < this.entries.length - 1) {
      this.cursor++;
      return this.entries[this.cursor] ?? null;
    }
    this.cursor = this.entries.length;
    return null;
  }

  getAll(): string[] {
    return [...this.entries];
  }

  resetCursor(): void {
    this.cursor = this.entries.length;
  }
}
