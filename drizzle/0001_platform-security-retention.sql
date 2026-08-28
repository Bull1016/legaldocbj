CREATE TABLE "twoFactor" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"secret" text NOT NULL,
	"backupCodes" text NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"failedVerificationCount" integer DEFAULT 0 NOT NULL,
	"lockedUntil" timestamp
);
--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "paymentUrl" text;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "legalHold" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "request" ADD COLUMN "legalHold" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "two_factor_user_id_idx" ON "twoFactor" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "two_factor_secret_idx" ON "twoFactor" USING btree ("secret");--> statement-breakpoint
WITH "duplicate_pending" AS (
	SELECT "id", row_number() OVER (
		PARTITION BY "companyId" ORDER BY "createdAt" DESC, "id" DESC
	) AS "position"
	FROM "subscription"
	WHERE "status" = 'pending'
)
UPDATE "payment"
SET "status" = 'canceled', "updatedAt" = now()
FROM "duplicate_pending"
WHERE "payment"."subscriptionId" = "duplicate_pending"."id"
	AND "duplicate_pending"."position" > 1
	AND "payment"."status" = 'pending';--> statement-breakpoint
WITH "duplicate_pending" AS (
	SELECT "id", row_number() OVER (
		PARTITION BY "companyId" ORDER BY "createdAt" DESC, "id" DESC
	) AS "position"
	FROM "subscription"
	WHERE "status" = 'pending'
)
UPDATE "subscription"
SET "status" = 'canceled'
FROM "duplicate_pending"
WHERE "subscription"."id" = "duplicate_pending"."id"
	AND "duplicate_pending"."position" > 1;--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_one_pending_per_company_idx" ON "subscription" USING btree ("companyId") WHERE "subscription"."status" = 'pending';
