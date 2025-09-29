import { NextRequest, NextResponse } from "next/server";
import { generateCitationPdf } from "@/server/pdf";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const pdfBuffer = await generateCitationPdf(Number(id));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=citation.pdf",
    },
  });
}
