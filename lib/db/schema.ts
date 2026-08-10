import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
} from "drizzle-orm/pg-core"

// ---------------------------------------------------------------------------
// Better Auth tables (column names must stay camelCase to match Better Auth)
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("client"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Application tables
// ---------------------------------------------------------------------------

// A document type = a "démarche" the platform offers (e.g. Casier judiciaire).
export const documentType = pgTable("document_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category"),
  price: integer("price").notNull().default(0), // in cents
  active: boolean("active").notNull().default(true),
  createdBy: text("createdBy").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Fields the admin/agent defines for a given document type.
// fieldType: text | textarea | date | number | select | file
export const documentField = pgTable("document_field", {
  id: serial("id").primaryKey(),
  documentTypeId: integer("documentTypeId").notNull(),
  label: text("label").notNull(),
  fieldKey: text("fieldKey").notNull(),
  fieldType: text("fieldType").notNull().default("text"),
  required: boolean("required").notNull().default(true),
  options: text("options"), // JSON string for select options
  helpText: text("helpText"),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// A request created by a client for a given document type.
// status: draft | submitted | in_review | need_info | completed | rejected
export const request = pgTable("request", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  userId: text("userId").notNull(),
  documentTypeId: integer("documentTypeId").notNull(),
  status: text("status").notNull().default("draft"),
  assignedTo: text("assignedTo"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Submitted values for each field of a request (text or file).
export const requestValue = pgTable("request_value", {
  id: serial("id").primaryKey(),
  requestId: integer("requestId").notNull(),
  fieldId: integer("fieldId").notNull(),
  fieldKey: text("fieldKey").notNull(),
  value: text("value"),
  fileUrl: text("fileUrl"),
  fileName: text("fileName"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Activity log / status history for a request.
export const requestEvent = pgTable("request_event", {
  id: serial("id").primaryKey(),
  requestId: integer("requestId").notNull(),
  actorId: text("actorId").notNull(),
  actorName: text("actorName"),
  type: text("type").notNull(),
  message: text("message"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
