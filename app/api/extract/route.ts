import { NextRequest, NextResponse } from "next/server";
import { extractDataFromDocument } from "@/lib/gemini";
import { DocumentType } from "@/types";

// Configuração para permitir uploads maiores (até 50MB)
export const runtime = "nodejs";
export const maxDuration = 60; // 60 segundos timeout

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

    // Verifica tamanho do arquivo (limite de 20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Tamanho máximo: 20MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
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
      documentType,
      file.name
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
