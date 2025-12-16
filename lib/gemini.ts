import { DocumentType } from "@/types";
import { getPromptForDocumentType } from "./prompts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_UPLOAD_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files";

// Limite de 4MB para inline data (usa File API para arquivos maiores)
const INLINE_SIZE_LIMIT = 4 * 1024 * 1024;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

interface UploadedFile {
  file: {
    name: string;
    uri: string;
    mimeType: string;
    state: string;
  };
}

async function uploadFileToGemini(
  fileBase64: string,
  mimeType: string,
  fileName: string
): Promise<string> {
  // Converte base64 para binary
  const binaryData = Buffer.from(fileBase64, "base64");

  // Inicia o upload resumable
  const initResponse = await fetch(`${GEMINI_UPLOAD_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": binaryData.length.toString(),
      "X-Goog-Upload-Header-Content-Type": mimeType,
    },
    body: JSON.stringify({
      file: {
        display_name: fileName,
      },
    }),
  });

  if (!initResponse.ok) {
    const errorText = await initResponse.text();
    throw new Error(`Failed to init upload: ${initResponse.status} - ${errorText}`);
  }

  const uploadUrl = initResponse.headers.get("X-Goog-Upload-URL");
  if (!uploadUrl) {
    throw new Error("No upload URL returned");
  }

  // Faz o upload do arquivo
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": binaryData.length.toString(),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: binaryData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Failed to upload file: ${uploadResponse.status} - ${errorText}`);
  }

  const uploadResult: UploadedFile = await uploadResponse.json();

  // Aguarda o arquivo ser processado
  let fileState = uploadResult.file.state;
  let fileUri = uploadResult.file.uri;
  let fileName2 = uploadResult.file.name;

  while (fileState === "PROCESSING") {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const statusResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName2}?key=${GEMINI_API_KEY}`
    );

    if (statusResponse.ok) {
      const statusResult = await statusResponse.json();
      fileState = statusResult.state;
      fileUri = statusResult.uri;
    }
  }

  if (fileState === "FAILED") {
    throw new Error("File processing failed");
  }

  return fileUri;
}

export async function extractDataFromDocument(
  fileBase64: string,
  mimeType: string,
  documentType: DocumentType,
  fileName?: string
): Promise<unknown> {
  const prompt = getPromptForDocumentType(documentType);

  // Calcula o tamanho do arquivo
  const fileSize = Buffer.from(fileBase64, "base64").length;

  let requestBody;

  if (fileSize > INLINE_SIZE_LIMIT) {
    // Arquivo grande: usa File API
    console.log(`Large file (${(fileSize / 1024 / 1024).toFixed(2)}MB), using File API...`);

    const fileUri = await uploadFileToGemini(fileBase64, mimeType, fileName || "document");

    requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              file_data: {
                mime_type: mimeType,
                file_uri: fileUri,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 8192,
      },
    };
  } else {
    // Arquivo pequeno: usa inline data
    requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: fileBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 8192,
      },
    };
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini API error: ${data.error.message}`);
  }

  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error("No response from Gemini API");
  }

  // Limpa o texto para extrair apenas o JSON
  let cleanedText = textResponse.trim();

  // Remove possíveis marcadores de código markdown
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.slice(3);
  }

  if (cleanedText.endsWith("```")) {
    cleanedText = cleanedText.slice(0, -3);
  }

  cleanedText = cleanedText.trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    console.error("Failed to parse Gemini response:", cleanedText);
    throw new Error("Failed to parse Gemini response as JSON");
  }
}

export async function extractDataFromMultipleDocuments(
  files: Array<{ base64: string; mimeType: string }>,
  documentType: DocumentType
): Promise<unknown> {
  const prompt = getPromptForDocumentType(documentType);

  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [
    { text: prompt + "\n\nAnalise todos os documentos a seguir e consolide as informações:" },
  ];

  for (const file of files) {
    parts.push({
      inline_data: {
        mime_type: file.mimeType,
        data: file.base64,
      },
    });
  }

  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini API error: ${data.error.message}`);
  }

  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error("No response from Gemini API");
  }

  let cleanedText = textResponse.trim();

  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.slice(3);
  }

  if (cleanedText.endsWith("```")) {
    cleanedText = cleanedText.slice(0, -3);
  }

  cleanedText = cleanedText.trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    console.error("Failed to parse Gemini response:", cleanedText);
    throw new Error("Failed to parse Gemini response as JSON");
  }
}
