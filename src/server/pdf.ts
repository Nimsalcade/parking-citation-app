import PDFDocument from "pdfkit";
import { citations, officers, vehicles, violations, db } from "@/db";
import { eq } from "drizzle-orm";

export async function generateCitationPdf(citationId: number) {
  const citation = db
    .select({
      citationNumber: citations.citationNumber,
      issuedAt: citations.issuedAt,
      location: citations.location,
      notes: citations.notes,
      status: citations.status,
      amountDue: citations.amountDue,
      dueDate: citations.dueDate,
      officerName: officers.name,
      badgeNumber: officers.badgeNumber,
      vehiclePlate: vehicles.licensePlate,
      vehicleState: vehicles.state,
      vehicleMake: vehicles.make,
      vehicleModel: vehicles.model,
      vehicleColor: vehicles.color,
      violationCode: violations.code,
      violationDescription: violations.description,
      fineAmount: violations.fineAmount,
    })
    .from(citations)
    .leftJoin(officers, eq(citations.officerId, officers.id))
    .leftJoin(vehicles, eq(citations.vehicleId, vehicles.id))
    .leftJoin(violations, eq(citations.violationId, violations.id))
    .where(eq(citations.id, citationId))
    .get();

  if (!citation) {
    throw new Error("Citation not found");
  }

  const doc = new PDFDocument({ margin: 50 });
  const buffers: Buffer[] = [];
  doc.on("data", (chunk) => {
    buffers.push(chunk as Buffer);
  });

  doc.fontSize(20).text("Parking Citation", { align: "center" }).moveDown();

  doc.fontSize(12);
  doc.text(`Citation #: ${citation.citationNumber || "N/A"}`);
  doc.text(`Issued At: ${citation.issuedAt || "N/A"}`);
  doc.text(`Location: ${citation.location}`);
  doc.text(`Status: ${citation.status}`);
  doc.text(`Amount Due: $${citation.amountDue.toFixed(2)}`);
  doc.text(`Due Date: ${citation.dueDate ?? "N/A"}`).moveDown();

  doc.fontSize(14).text("Officer", { underline: true });
  doc.fontSize(12);
  doc.text(`Name: ${citation.officerName || "N/A"}`);
  doc.text(`Badge #: ${citation.badgeNumber || "N/A"}`).moveDown();

  doc.fontSize(14).text("Vehicle", { underline: true });
  doc.fontSize(12);
  doc.text(
    `Plate: ${citation.vehiclePlate || "N/A"} (${citation.vehicleState || "--"})`
  );
  doc.text(
    `Make/Model: ${citation.vehicleMake || "N/A"} ${citation.vehicleModel || ""}`,
  );
  doc.text(`Color: ${citation.vehicleColor || "N/A"}`).moveDown();

  doc.fontSize(14).text("Violation", { underline: true });
  doc.fontSize(12);
  doc.text(`Code: ${citation.violationCode}`);
  doc.text(`Description: ${citation.violationDescription}`);
  const fineAmount = citation.fineAmount ?? 0;
  doc.text(`Fine Amount: $${fineAmount.toFixed(2)}`).moveDown();

  if (citation.notes) {
    doc.fontSize(14).text("Notes", { underline: true });
    doc.fontSize(12).text(citation.notes).moveDown();
  }

  doc.end();

  await new Promise<void>((resolve) => {
    doc.on("end", () => resolve());
  });

  return Buffer.concat(buffers);
}
