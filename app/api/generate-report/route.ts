import { NextRequest, NextResponse } from "next/server";
import { generateWordReport } from "@/lib/report-generator";
import { generatePdfHtml } from "@/lib/pdf-generator";
import { RelatorioBoasVindas } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, format } = body as { data: RelatorioBoasVindas; format: "pdf" | "word" };

    if (!data) {
      return NextResponse.json(
        { error: "Dados do relatório não fornecidos" },
        { status: 400 }
      );
    }

    if (format === "word") {
      const buffer = await generateWordReport(data);
      const uint8Array = new Uint8Array(buffer);

      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="relatorio-boas-vindas-${new Date().toISOString().split("T")[0]}.docx"`,
        },
      });
    } else {
      // Para PDF, geramos HTML que pode ser convertido no cliente
      const html = generatePdfHtml(data);

      // Retorna HTML para o cliente converter em PDF via print
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao gerar relatório",
      },
      { status: 500 }
    );
  }
}
