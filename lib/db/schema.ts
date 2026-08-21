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
  twoFactorEnabled: boolean("twoFactorEnabled").notNull().default(false),
  twoFactorSecret: text("twoFactorSecret"),
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

// A document type = a "démarche" the platform offers (e.g. Casier judiciaire, Création SARL...).
export const documentType = pgTable("document_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category"),
  price: integer("price").notNull().default(0), // in XOF
  active: boolean("active").notNull().default(true),
  country: text("country").notNull().default("BJ"),
  createdBy: text("createdBy").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Fields the admin/agent defines for a given document type.
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
export const request = pgTable("request", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  userId: text("userId").notNull(),
  documentTypeId: integer("documentTypeId").notNull(),
  companyId: integer("companyId"),
  status: text("status").notNull().default("draft"),
  paymentStatus: text("paymentStatus").notNull().default("unpaid"), // unpaid | pending | paid
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

// Companies registered or managed on the platform.
export const company = pgTable("company", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  legalForm: text("legalForm").notNull(), // SARL, SUARL, SAS, Établissement, SA, GIE
  rccm: text("rccm"),
  ifu: text("ifu"),
  capital: integer("capital").default(0),
  address: text("address"),
  city: text("city").default("Cotonou"),
  country: text("country").notNull().default("BJ"),
  status: text("status").notNull().default("active"), // in_creation | active | dissolved
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Payment transactions (FedaPay, Mobile Money, Card)
export const payment = pgTable("payment", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  userId: text("userId").notNull(),
  requestId: integer("requestId"),
  subscriptionId: integer("subscriptionId"),
  amount: integer("amount").notNull(), // in XOF
  currency: text("currency").notNull().default("XOF"),
  provider: text("provider").notNull().default("fedapay"),
  transactionId: text("transactionId"), // External FedaPay Transaction ID
  status: text("status").notNull().default("pending"), // pending | approved | declined | canceled
  mode: text("mode"), // mtm, moov, card, etc.
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Audit log for security & compliance
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actorId: text("actorId").notNull(),
  actorName: text("actorName"),
  actorRole: text("actorRole").notNull(),
  action: text("action").notNull(), // e.g. "USER_ROLE_UPDATED", "DOCUMENT_SUBMITTED", "PAYMENT_RECEIVED"
  entityType: text("entityType").notNull(), // "user", "request", "company", "payment"
  entityId: text("entityId"),
  details: text("details"), // JSON or string
  ipAddress: text("ipAddress"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Legal document templates (statuts, contrats, PV)
export const legalTemplate = pgTable("legal_template", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // "Statuts", "Contrats", "Procès-verbaux", "Conformité"
  description: text("description"),
  fields: text("fields"), // JSON string defining form fields for the template
  content: text("content").notNull(), // Markdown / template text with placeholders {{field}}
  isFree: boolean("isFree").notNull().default(true),
  price: integer("price").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Legal advice & consultation tickets
export const legalAdvice = pgTable("legal_advice", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("Question Juridique"),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending | assigned | answered | closed
  assignedAgentId: text("assignedAgentId"),
  response: text("response"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Corporate & Legal obligations calendar/tracking
export const obligation = pgTable("obligation", {
  id: serial("id").primaryKey(),
  companyId: integer("companyId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate").notNull(),
  category: text("category").notNull().default("Fiscale"), // Fiscale | Sociale | Juridique
  status: text("status").notNull().default("pending"), // pending | completed | overdue
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Corporate Subscriptions (Secrétariat Juridique / Pack Entreprise)
export const subscription = pgTable("subscription", {
  id: serial("id").primaryKey(),
  companyId: integer("companyId").notNull(),
  userId: text("userId").notNull(),
  plan: text("plan").notNull(), // "starter" | "pro" | "enterprise"
  status: text("status").notNull().default("active"), // active | canceled | expired
  price: integer("price").notNull().default(0), // XOF per month
  startDate: timestamp("startDate").notNull().defaultNow(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Resources & Blog articles
export const resourceArticle = pgTable("resource_article", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(), // "Guides", "Droit des Sociétés", "Fiscalité", "OHADA"
  summary: text("summary"),
  content: text("content").notNull(),
  country: text("country").notNull().default("BJ"),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})
