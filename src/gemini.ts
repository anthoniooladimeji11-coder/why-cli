import { GoogleGenAI } from "@google/genai";

interface ExplainInput {
  command: string;
  output?: string;
  exitCode?: number;
}

export async function explainCommand(input: ExplainInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/app/apikey and run:\n  export GEMINI_API_KEY=your_key_here"
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = buildPrompt(input);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "(no response from Gemini)";
}

function buildPrompt(input: ExplainInput): string {
  const { command, output, exitCode } = input;

  // Rich path: we have the actual output. Give Gemini the real context.
  if (output && output.trim().length > 0) {
    return `A developer just ran this command in their terminal and it failed:

\`\`\`
$ ${command}
\`\`\`

Exit code: ${exitCode ?? "unknown"}

Here is the actual output / error from the command:

\`\`\`
${output}
\`\`\`

Explain in 2-4 short sentences:
1. What went wrong (based on the actual error, not guessing)
2. A concrete fix they can try

Be direct. No preamble. No "Great question!". Reference the actual error in the output.`;
  }

  // Fallback path: no captured output. Make it clear we're guessing.
  return `A developer just ran this command in their terminal and it failed or confused them:

\`\`\`
${command}
\`\`\`

I don't have the actual error output, so I can only reason from the command itself.

Explain in 2-4 short sentences:
1. What the command was trying to do
2. The most likely reason it failed
3. A concrete fix they can try

Be direct. No preamble. No "Great question!". If multiple causes are likely, say so briefly.`;
}
