import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const officers = sqliteTable("officers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  badgeNumber: text("badge_number").notNull().unique(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const vehicles = sqliteTable("vehicles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  licensePlate: text("license_plate").notNull(),
  state: text("state").notNull(),
  make: text("make"),
  model: text("model"),
  color: text("color"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const violations = sqliteTable("violations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  description: text("description").notNull(),
  fineAmount: real("fine_amount").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const citations = sqliteTable("citations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  citationNumber: text("citation_number").notNull().unique(),
  officerId: integer("officer_id").references(() => officers.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  violationId: integer("violation_id").references(() => violations.id).notNull(),
  issuedAt: text("issued_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  location: text("location").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("issued"),
  dueDate: text("due_date"),
  amountDue: real("amount_due").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
