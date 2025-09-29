import { db, officers, vehicles, violations, citations } from "@/db";

let seeded = false;

export function seedDefaults() {
  if (seeded) {
    return;
  }

  seeded = true;

  const officerExists = db.select({ value: officers.id }).from(officers).limit(1).get();

  if (!officerExists) {
    db.insert(officers)
      .values([
        { name: "Officer Jane Smith", badgeNumber: "A123" },
        { name: "Officer John Doe", badgeNumber: "B456" },
        { name: "Officer Priya Gomez", badgeNumber: "C789" },
      ])
      .run();
  }

  const vehicleExists = db.select({ value: vehicles.id }).from(vehicles).limit(1).get();
  if (!vehicleExists) {
    db.insert(vehicles)
      .values([
        {
          licensePlate: "XYZ-1234",
          state: "CA",
          make: "Toyota",
          model: "Camry",
          color: "Blue",
        },
        {
          licensePlate: "ABC-9876",
          state: "CA",
          make: "Honda",
          model: "Civic",
          color: "Red",
        },
        {
          licensePlate: "LMN-5521",
          state: "CA",
          make: "Tesla",
          model: "Model 3",
          color: "Black",
        },
      ])
      .run();
  }

  const violationExists = db.select({ value: violations.id }).from(violations).limit(1).get();
  if (!violationExists) {
    db.insert(violations)
      .values([
        {
          code: "P001",
          description: "Expired Meter",
          fineAmount: 45,
        },
        {
          code: "P002",
          description: "No Parking Zone",
          fineAmount: 65,
        },
        {
          code: "P003",
          description: "Blocking Driveway",
          fineAmount: 85,
        },
      ])
      .run();
  }

  const citationExists = db.select({ value: citations.id }).from(citations).limit(1).get();
  if (!citationExists) {
    const officerList = db.select({ id: officers.id }).from(officers).all();
    const vehicleList = db.select({ id: vehicles.id }).from(vehicles).all();
    const violationList = db
      .select({ id: violations.id, fineAmount: violations.fineAmount })
      .from(violations)
      .all();

    if (officerList.length && vehicleList.length && violationList.length) {
      const sampleCitations = [
        {
          citationNumber: "CIT-1001",
          officerId: officerList[0].id,
          vehicleId: vehicleList[0].id,
          violationId: violationList[0].id,
          location: "123 Main St",
          status: "issued",
          dueDate: "2025-10-31",
          amountDue: violationList[0].fineAmount,
          notes: "Meter expired",
        },
        {
          citationNumber: "CIT-1002",
          officerId: officerList[1]?.id ?? officerList[0].id,
          vehicleId: vehicleList[1]?.id ?? vehicleList[0].id,
          violationId: violationList[1]?.id ?? violationList[0].id,
          location: "456 Market St",
          status: "paid",
          dueDate: "2025-09-15",
          amountDue: violationList[1]?.fineAmount ?? violationList[0].fineAmount,
          notes: "Vehicle blocking loading zone",
        },
      ];

      db.insert(citations).values(sampleCitations).run();
    }
  }
}
