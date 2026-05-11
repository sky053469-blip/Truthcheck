import type { Config } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../../db/index.js";
import { verifications } from "../../db/schema.js";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are TruthCheck AI — an expert fact-checker. Verify the given claim by searching the live web (use web_search once for the most critical angle). Be concise and fast.

Return ONLY valid JSON with this exact structure, no markdown fences, no extra text:
{"verdict":"REAL","confidence":85,"credibilityScore":80,"summary":"2-sentence summary of findings.","claims":[{"claim":"specific claim","status":"VERIFIED","explanation":"why it's true/false","source":"Reuters, BBC"}],"redFlags":["specific red flag"],"positiveIndicators":["specific signal"],"sourcesChecked":["Reuters","AP News","BBC"],"recommendation":"Actionable advice for the reader.","category":"Politics","searchInsights":"Most important finding from web search."}

verdict values: REAL, FAKE, MISLEADING, UNVERIFIED
claim status values: VERIFIED, FALSE, MISLEADING, UNVERIFIED
- REAL: supported by credible evidence
- FAKE: contradicted by evidence
- MISLEADING: partially true but missing context or framed deceptively
- UNVERIFIED: insufficient evidence found — do not guess`;

function parseJsonFromText(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { inputType?: string; inputText?: string; imageData?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { inputType = "text", inputText = "", imageData } = body;

  if (inputType !== "image" && !inputText.trim()) {
    return Response.json({ error: "No input provided" }, { status: 400 });
  }
  if (inputType === "image" && !imageData) {
    return Response.json({ error: "No image data provided" }, { status: 400 });
  }

  let userContent: Anthropic.MessageParam["content"];
  if (inputType === "image" && imageData) {
    userContent = [
      {
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: imageData },
      },
      {
        type: "text",
        text: "Fact-check the claims visible in this image. Search the web for relevant information. Return JSON only.",
      },
    ];
  } else if (inputType === "url") {
    userContent = `Fact-check the article at this URL. Fetch and search for related information. Return JSON only:\n\n${inputText}`;
  } else {
    userContent = `Fact-check this claim or article. Search for corroborating or contradicting evidence. Return JSON only:\n\n${inputText}`;
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" } as never],
      messages: [{ role: "user", content: userContent }],
    });

    const textBlocks = response.content.filter((b) => b.type === "text") as Array<{ type: "text"; text: string }>;
    if (textBlocks.length === 0) {
      return Response.json(
        { error: "No analysis returned. Please try a simpler claim." },
        { status: 422 }
      );
    }

    const fullText = textBlocks.map((b) => b.text).join("");
    const parsed = parseJsonFromText(fullText);

    if (!parsed || !parsed.verdict) {
      return Response.json(
        { error: "Could not parse AI response. Please try again." },
        { status: 422 }
      );
    }

    const validVerdicts = ["REAL", "FAKE", "MISLEADING", "UNVERIFIED"];
    if (!validVerdicts.includes(parsed.verdict as string)) {
      return Response.json({ error: "Invalid verdict returned." }, { status: 422 });
    }

    // Persist to database
    try {
      await db.insert(verifications).values({
        inputType,
        inputText: inputType === "image" ? "[Image verification]" : inputText.slice(0, 1000),
        verdict: parsed.verdict as string,
        confidence: (parsed.confidence as number) || 0,
        credibilityScore: (parsed.credibilityScore as number) || 0,
        category: (parsed.category as string) || "General",
        resultJson: JSON.stringify(parsed),
      });
    } catch {
      // Non-fatal: proceed even if DB save fails
    }

    return Response.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return Response.json({ error: message }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/verify",
};
