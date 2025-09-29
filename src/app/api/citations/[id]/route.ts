import { NextRequest, NextResponse } from "next/server";
import { getCitationById, updateCitationStatus } from "@/server/actions";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);
  const citation = await getCitationById(id);

  if (!citation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(citation);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);
  const body = await req.json();
  const { status } = body as { status: "issued" | "paid" | "void" };

  const updated = await updateCitationStatus(id, status);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
