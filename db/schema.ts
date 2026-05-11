import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const verifications = pgTable("verifications", {
  id: serial().primaryKey(),
  inputType: text("input_type").notNull().default("text"),
  inputText: text("input_text").notNull(),
  verdict: text().notNull(),
  confidence: integer().notNull().default(0),
  credibilityScore: integer("credibility_score").notNull().default(0),
  category: text().notNull().default("General"),
  resultJson: text("result_json").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
