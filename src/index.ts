#!/usr/bin/env node
import chalk from "chalk";
import { getCapturedRun, getLastCommand } from "./shell-history.js";
import { explainCommand } from "./gemini.js";

async function main() {
  const captured = getCapturedRun();

  // Prefer the captured run from `wr` if we have one.
  if (captured) {
    console.log(chalk.gray("Last command:"), chalk.cyan(captured.command));
    console.log(chalk.gray("Exit code:"), chalk.yellow(String(captured.exitCode)));
    console.log(chalk.gray("Thinking..."));
    console.log();

    try {
      const explanation = await explainCommand({
        command: captured.command,
        output: captured.output,
        exitCode: captured.exitCode,
      });
      console.log(chalk.white(explanation));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red("✗ " + message));
      process.exit(1);
    }
    return;
  }

  // Fallback: pull the last command from zsh history.
  const command = getLastCommand();

  if (!command) {
    console.error(chalk.red("✗ Couldn't find your last command."));
    console.error(chalk.gray("  Tip: prefix commands with `wr` to capture their output for better explanations."));
    process.exit(1);
  }

  console.log(chalk.gray("Last command:"), chalk.cyan(command));
  console.log(chalk.gray("(no captured output — guessing from command alone)"));
  console.log(chalk.gray("Thinking..."));
  console.log();

  try {
    const explanation = await explainCommand({ command });
    console.log(chalk.white(explanation));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red("✗ " + message));
    process.exit(1);
  }
}

main();
