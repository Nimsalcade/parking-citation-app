export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { seedDefaults } from "@/server/seed";

export async function POST() {
  seedDefaults();
  return NextResponse.json({ status: "ok" });
}