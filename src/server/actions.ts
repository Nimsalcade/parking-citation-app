"use server";

import { db, citations, officers, vehicles, violations } from "@/db";
import { eq, count, sum, sql, desc } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { citationSchema } from "@/lib/validators";
import { seedDefaults } from "@/server/seed";

seedDefaults();

export async function getDashboardData() {
  const totalCitations = db.select({ value: count() }).from(citations).get()?.value ?? 0;
  const totalUnpaid =
    db
      .select({ value: count() })
      .from(citations)
      .where(eq(citations.status, "issued"))
      .get()?.value ?? 0;

  const totalCollected =
    db
      .select({ value: sum(citations.amountDue) })
      .from(citations)
      .where(eq(citations.status, "paid"))
      .get()?.value ?? 0;

  const recentCitations = db
    .select({
      id: citations.id,
      citationNumber: citations.citationNumber,
      issuedAt: citations.issuedAt,
      vehicleId: citations.vehicleId,
      officerId: citations.officerId,
      violationId: citations.violationId,
      status: citations.status,
      amountDue: citations.amountDue,
      location: citations.location,
    })
    .from(citations)
    .orderBy(desc(citations.issuedAt))
    .limit(10)
    .all();

  const officerCount = db.select({ value: count() }).from(officers).get()?.value ?? 0;
  const violationCount = db.select({ value: count() }).from(violations).get()?.value ?? 0;

  const monthlyTrend = db
    .select({
      month: sql<string>`strftime('%Y-%m', ${citations.issuedAt})`,
      total: count(),
    })
    .from(citations)
    .groupBy(sql`strftime('%Y-%m', ${citations.issuedAt})`)
    .orderBy(sql`strftime('%Y-%m', ${citations.issuedAt})`)
    .all();

  return {
    totalCitations,
    totalUnpaid,
    totalCollected: totalCollected ?? 0,
    officerCount,
    violationCount,
    recentCitations,
    monthlyTrend,
  };
}

export async function createCitation(payload: unknown) {
  const parsed = citationSchema.parse(payload);

  const citationNumber = parsed.citationNumber || `CIT-${randomUUID().slice(0, 8)}`;

  const citation = db
    .insert(citations)
    .values({
      ...parsed,
      citationNumber,
    })
    .returning()
    .get();

  return citation;
}

export async function updateCitationStatus(id: number, status: "issued" | "paid" | "void") {
  const result = db
    .update(citations)
    .set({ status })
    .where(eq(citations.id, id))
    .returning()
    .get();

  return result;
}

export async function getCitationById(id: number) {
  return db
    .select({
      id: citations.id,
      citationNumber: citations.citationNumber,
      issuedAt: citations.issuedAt,
      location: citations.location,
      status: citations.status,
      amountDue: citations.amountDue,
      officerId: citations.officerId,
      officerName: officers.name,
      badgeNumber: officers.badgeNumber,
      vehicleId: citations.vehicleId,
      vehiclePlate: vehicles.licensePlate,
      vehicleState: vehicles.state,
      vehicleMake: vehicles.make,
      vehicleModel: vehicles.model,
      vehicleColor: vehicles.color,
      violationId: citations.violationId,
      violationCode: violations.code,
      violationDescription: violations.description,
      violationFine: violations.fineAmount,
      notes: citations.notes,
      dueDate: citations.dueDate,
    })
    .from(citations)
    .leftJoin(officers, eq(citations.officerId, officers.id))
    .leftJoin(vehicles, eq(citations.vehicleId, vehicles.id))
    .leftJoin(violations, eq(citations.violationId, violations.id))
    .where(eq(citations.id, id))
    .get();
}

export async function getAllCitations() {
  return db
    .select({
      id: citations.id,
      citationNumber: citations.citationNumber,
      issuedAt: citations.issuedAt,
      location: citations.location,
      status: citations.status,
      amountDue: citations.amountDue,
      officerId: citations.officerId,
      officerName: officers.name,
      badgeNumber: officers.badgeNumber,
      vehicleId: citations.vehicleId,
      vehiclePlate: vehicles.licensePlate,
      vehicleState: vehicles.state,
      vehicleMake: vehicles.make,
      vehicleModel: vehicles.model,
      vehicleColor: vehicles.color,
      violationId: citations.violationId,
      violationCode: violations.code,
      violationDescription: violations.description,
      violationFine: violations.fineAmount,
      notes: citations.notes,
      dueDate: citations.dueDate,
    })
    .from(citations)
    .leftJoin(officers, eq(citations.officerId, officers.id))
    .leftJoin(vehicles, eq(citations.vehicleId, vehicles.id))
    .leftJoin(violations, eq(citations.violationId, violations.id))
    .orderBy(desc(citations.issuedAt))
    .all();
}

export async function getReferenceData() {
  const officerList = db.select().from(officers).orderBy(officers.name).all();
  const vehicleList = db.select().from(vehicles).orderBy(vehicles.licensePlate).all();
  const violationList = db.select().from(violations).orderBy(violations.code).all();

  return {
    officers: officerList.map((o) => ({ id: o.id, name: o.name, badgeNumber: o.badgeNumber })),
    vehicles: vehicleList.map((v) => ({
      id: v.id,
      label: `${v.licensePlate} • ${v.make ?? "Unknown"} ${v.model ?? ""}`.trim(),
    })),
    violations: violationList.map((violation) => ({
      id: violation.id,
      code: violation.code,
      description: violation.description,
      fineAmount: violation.fineAmount,
    })),
  };
}
