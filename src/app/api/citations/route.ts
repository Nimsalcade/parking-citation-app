import { NextRequest, NextResponse } from "next/server";
import { createCitation, getAllCitations } from "@/server/actions";

export async function GET() {
  const list = await getAllCitations();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const created = await createCitation(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
