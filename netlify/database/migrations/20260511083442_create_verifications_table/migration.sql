CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY,
	"input_type" text DEFAULT 'text' NOT NULL,
	"input_text" text NOT NULL,
	"verdict" text NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"credibility_score" integer DEFAULT 0 NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"result_json" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
