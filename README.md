# why

> You ran a command. It failed. You don't know why. Now you do.

`why` is a stupidly small CLI that looks at the last command you ran in your terminal, sends it to an AI, and explains — in plain English — what it was trying to do, why it probably broke, and how to fix it.

```bash
$ git push
error: failed to push some refs to 'origin'
hint: Updates were rejected because the remote contains work that you do not have locally.

$ why
You tried to push local commits to the remote, but someone (maybe you, on another machine)
pushed changes there first. Git refuses to overwrite them by default. Fix: run `git pull --rebase`
to pull those changes in on top of yours, then push again.
```

That's the whole pitch.

## Why does this exist?

Because I've typed "what does this error mean" into Google approximately 40,000 times in my career, and I figured at some point I should just teach my terminal to do it for me.

Also because scrolling through Stack Overflow to find out you had a typo is a uniquely humbling experience, and I would like to skip that step.

## Install

```bash
# Coming soon to npm. For now:
git clone https://github.com/anthoniooladimeji11-coder/why-cli.git
cd why-cli && npm install && npm link
```

You'll need a **free** Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Once you have one:

```bash
export GEMINI_API_KEY=your_key_here
```

(Add that line to your `~/.zshrc` if you want it to persist across terminal sessions.)

## Usage

Run any command. When it inevitably betrays you, run:

```bash
why
```

That's the whole interface. No flags, no subcommands, no 400-line `--help` output. Just `why`.

## How it works

1. Reads your last command from `~/.zsh_history`
2. Sends it to Gemini with a prompt that says "please explain this to a human"
3. Prints the explanation

That's genuinely it. The source code is about 80 lines. You could read it in less time than it takes to finish this README.

## Development

```bash
git clone https://github.com/anthoniooladimeji11-coder/why-cli.git
cd why-cli
npm install
export GEMINI_API_KEY=your_key_here
npm run dev
```

## Roadmap

Things that would make this better, in rough order of usefulness:

- [ ] **bash support** (currently zsh only because that's what I use)
- [ ] **fish support** (for the one person on your team who uses fish)
- [ ] **Capture stderr automatically** so the AI sees the actual error, not just the command
- [ ] **`why yesterday`** — explain a command you ran earlier, not just the last one
- [ ] **Multi-provider support** — Claude, OpenAI, local Ollama models
- [ ] **Offline mode** for common errors (no API call needed for `command not found`)
- [ ] **Config file** (`~/.whyrc`) so you can pick your model / provider
- [ ] **Better prompts** — the current one is fine, but it could be much better

PRs welcome. Issues welcome. Opinions welcome.

## License

MIT — do whatever you want with it.

## Credits

Built by [@anthoniooladimeji11-coder](https://github.com/anthoniooladimeji11-coder) over a weekend, because rage-Googling error messages is a bad hobby.
