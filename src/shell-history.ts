import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Reads the last command the user ran from zsh history.
 * zsh stores history in ~/.zsh_history, one entry per line,
 * in the format: ": <timestamp>:<duration>;<command>"
 */
export function getLastCommand(): string | null {
  const historyPath = join(homedir(), ".zsh_history");

  try {
    const contents = readFileSync(historyPath, "utf8");
    const lines = contents.trim().split("\n").filter(Boolean);

    // Walk backwards and find the most recent command that isn't `why` itself
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const command = parseZshHistoryLine(line);
      if (!command) continue;
      if (command.trim().startsWith("why")) continue;
      return command;
    }

    return null;
  } catch (err) {
    return null;
  }
}

function parseZshHistoryLine(line: string): string | null {
  // Extended history format: ": 1713600000:0;git push"
  const match = line.match(/^: \d+:\d+;(.*)$/);
  if (match) return match[1];

  // Non-extended: just the command itself
  return line;
}
