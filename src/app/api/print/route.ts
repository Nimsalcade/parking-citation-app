import { NextRequest, NextResponse } from "next/server";
import { generateCitationPdf } from "@/server/pdf";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const citationId = Number(id);

    if (!Number.isFinite(citationId) || citationId <= 0) {
      return NextResponse.json({ error: "Invalid citation id." }, { status: 400 });
    }

    const pdfBuffer = await generateCitationPdf(citationId);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=citation.pdf",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate citation PDF." },
      { status: 500 },
    );
  }
}
