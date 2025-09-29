import { NextResponse } from "next/server";
import { getDashboardData } from "@/server/actions";

export async function GET() {
  const data = await getDashboardData();
  return NextResponse.json(data);
}
