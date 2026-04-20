import { GoogleGenAI } from "@google/genai";

export async function explainCommand(command: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/app/apikey and run:\n  export GEMINI_API_KEY=your_key_here"
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `A developer just ran this command in their terminal and it failed or confused them:

\`\`\`
${command}
\`\`\`

Explain in 2-4 short sentences:
1. What the command was trying to do
2. The most likely reason it failed
3. A concrete fix they can try

Be direct. No preamble. No "Great question!". Just the explanation.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "(no response from Gemini)";
}
