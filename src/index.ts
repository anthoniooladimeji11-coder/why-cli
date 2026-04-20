#!/usr/bin/env node
import chalk from "chalk";
import { getLastCommand } from "./shell-history.js";
import { explainCommand } from "./gemini.js";

async function main() {
  const command = getLastCommand();

  if (!command) {
    console.error(chalk.red("✗ Couldn't find your last command in shell history."));
    console.error(chalk.gray("  Make sure you're using zsh and have ~/.zsh_history set up."));
    process.exit(1);
  }

  console.log(chalk.gray("Last command:"), chalk.cyan(command));
  console.log(chalk.gray("Thinking..."));
  console.log();

  try {
    const explanation = await explainCommand(command);
    console.log(chalk.white(explanation));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red("✗ " + message));
    process.exit(1);
  }
}

main();
