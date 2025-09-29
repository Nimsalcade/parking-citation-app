import { NextResponse } from "next/server";
import { getReferenceData } from "@/server/actions";

export async function GET() {
  const data = await getReferenceData();
  return NextResponse.json(data);
}