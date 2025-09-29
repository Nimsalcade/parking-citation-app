import "server-only";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { join } from "node:path";
import fs from "node:fs";
import { citations, officers, vehicles, violations } from "./schema";

const dataDir = join(process.cwd(), "data");
const dbPath = join(dataDir, "app.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS "officers" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "name" TEXT NOT NULL,
    "badge_number" TEXT NOT NULL UNIQUE,
    "created_at" TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "color" TEXT,
    "created_at" TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "violations" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fine_amount" REAL NOT NULL,
    "created_at" TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "citations" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "citation_number" TEXT NOT NULL UNIQUE,
    "officer_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "violation_id" INTEGER NOT NULL,
    "issued_at" TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT DEFAULT 'issued' NOT NULL,
    "due_date" TEXT,
    "amount_due" REAL NOT NULL,
    "created_at" TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    FOREIGN KEY ("officer_id") REFERENCES "officers"("id"),
    FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id"),
    FOREIGN KEY ("violation_id") REFERENCES "violations"("id")
  );
`);

const db = drizzle(sqlite);

export { db, citations, officers, vehicles, violations };
