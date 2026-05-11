import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { verifications } from "../../db/schema.js";
import { desc } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method === "GET") {
    try {
      const rows = await db
        .select({
          id: verifications.id,
          inputType: verifications.inputType,
          inputText: verifications.inputText,
          verdict: verifications.verdict,
          confidence: verifications.confidence,
          credibilityScore: verifications.credibilityScore,
          category: verifications.category,
          createdAt: verifications.createdAt,
        })
        .from(verifications)
        .orderBy(desc(verifications.createdAt))
        .limit(50);

      return Response.json(rows);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Database error";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/history",
};
