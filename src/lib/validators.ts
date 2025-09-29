import { z } from "zod";

export const vehicleSchema = z.object({
  licensePlate: z.string().min(1),
  state: z.string().min(2).max(2),
  make: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
});

export const officerSchema = z.object({
  badgeNumber: z.string().min(1),
  name: z.string().min(1),
});

export const violationSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(1),
  fineAmount: z.number().positive(),
});

export const citationSchema = z.object({
  citationNumber: z.string().min(1).optional(),
  issuedAt: z.string().optional(),
  officerId: z.coerce.number().int().positive(),
  vehicleId: z.coerce.number().int().positive(),
  violationId: z.coerce.number().int().positive(),
  location: z.string().min(1),
  notes: z.string().optional(),
  status: z.enum(["issued", "paid", "void"]).default("issued"),
  dueDate: z.string().optional(),
  amountDue: z.coerce.number().positive(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type OfficerInput = z.infer<typeof officerSchema>;
export type ViolationInput = z.infer<typeof violationSchema>;
export type CitationInput = z.infer<typeof citationSchema>;
export type CitationFormInput = z.input<typeof citationSchema>;
