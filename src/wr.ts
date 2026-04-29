#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CACHE_DIR = join(homedir(), ".cache", "why");
const CACHE_FILE = join(CACHE_DIR, "last-run.json");

interface CaptureRecord {
  command: string;
  exitCode: number;
  output: string;
  timestamp: number;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: wr <command> [args...]");
    console.error("Example: wr npm install");
    process.exit(1);
  }

  const fullCommand = args.join(" ");

  // Spawn the user's command, inheriting their TTY so colors and prompts work.
  // We capture stdout/stderr in addition to letting them flow to the terminal.
  let captured = "";

  const child = spawn(args[0], args.slice(1), {
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout?.on("data", (chunk: Buffer) => {
    process.stdout.write(chunk);
    captured += chunk.toString();
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    process.stderr.write(chunk);
    captured += chunk.toString();
  });

  child.on("close", (code) => {
    const exitCode = code ?? 0;

    // Only save the capture if the command failed.
    if (exitCode !== 0) {
      try {
        mkdirSync(CACHE_DIR, { recursive: true });
        const record: CaptureRecord = {
          command: fullCommand,
          exitCode,
          // Truncate to last 100 lines to keep prompt size sane.
          output: lastNLines(captured, 100),
          timestamp: Date.now(),
        };
        writeFileSync(CACHE_FILE, JSON.stringify(record, null, 2));
      } catch {
        // Swallow cache errors silently — we don't want to confuse the user.
      }
    }

    process.exit(exitCode);
  });
}

function lastNLines(text: string, n: number): string {
  const lines = text.split("\n");
  if (lines.length <= n) return text;
  return lines.slice(-n).join("\n");
}

main();
