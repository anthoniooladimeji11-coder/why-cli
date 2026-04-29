import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CACHE_FILE = join(homedir(), ".cache", "why", "last-run.json");

// How fresh a wr capture must be to count as "the last command".
// Anything older than this and we ignore it (probably stale).
const CAPTURE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

export interface CapturedRun {
  command: string;
  exitCode: number;
  output: string;
}

/**
 * Reads the most recent `wr` capture if it's recent enough.
 * Returns null if no capture exists or it's stale.
 */
export function getCapturedRun(): CapturedRun | null {
  try {
    const raw = readFileSync(CACHE_FILE, "utf8");
    const record = JSON.parse(raw);

    if (typeof record.timestamp !== "number") return null;
    if (Date.now() - record.timestamp > CAPTURE_MAX_AGE_MS) return null;

    return {
      command: record.command,
      exitCode: record.exitCode,
      output: record.output,
    };
  } catch {
    return null;
  }
}

/**
 * Reads the last command the user ran from zsh history.
 * Used as a fallback when no `wr` capture is available.
 */
export function getLastCommand(): string | null {
  const historyPath = join(homedir(), ".zsh_history");

  try {
    const contents = readFileSync(historyPath, "utf8");
    const lines = contents.trim().split("\n").filter(Boolean);

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const command = parseZshHistoryLine(line);
      if (!command) continue;
      const trimmed = command.trim();
      if (trimmed.startsWith("why")) continue;
      if (trimmed.startsWith("wr ") || trimmed === "wr") continue;
      return command;
    }

    return null;
  } catch {
    return null;
  }
}

function parseZshHistoryLine(line: string): string | null {
  const match = line.match(/^: \d+:\d+;(.*)$/);
  if (match) return match[1];
  return line;
}
