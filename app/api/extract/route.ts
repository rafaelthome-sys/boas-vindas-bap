import { NextRequest, NextResponse } from "next/server";
import { extractDataFromDocument } from "@/lib/gemini";
import { DocumentType } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as DocumentType;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { error: "Tipo de documento não especificado" },
        { status: 400 }
      );
    }

    // Converte o arquivo para base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Determina o mime type
    let mimeType = file.type;

    // Ajustes para tipos comuns
    if (file.name.endsWith(".pdf")) {
      mimeType = "application/pdf";
    } else if (file.name.endsWith(".doc")) {
      mimeType = "application/msword";
    } else if (file.name.endsWith(".docx")) {
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    // Extrai dados usando Gemini
    const extractedData = await extractDataFromDocument(
      base64,
      mimeType,
      documentType
    );

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao processar documento",
      },
      { status: 500 }
    );
  }
}
