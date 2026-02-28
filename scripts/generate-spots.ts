import { writeFile } from "node:fs/promises";

type SeedSpot = {
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  hours: Record<string, Array<{ open: string; close: string }>>;
  tags: string[];
};

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required");
  }

  const prompt = `Generate 50 unique interesting spots in Denver, Colorado as JSON array only. Fields: name, description, category, latitude, longitude, hours, tags.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = data.content?.find((chunk) => chunk.type === "text")?.text;
  if (!text) {
    throw new Error("No text content returned by Claude");
  }

  const parsed = extractJsonArray(text);
  await writeFile("scripts/seed-spots.json", JSON.stringify(parsed, null, 2));
}

function extractJsonArray(text: string): SeedSpot[] {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text;

  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude response did not include a JSON array");
  }

  return JSON.parse(candidate.slice(start, end + 1)) as SeedSpot[];
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
