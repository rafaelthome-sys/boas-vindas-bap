import { DocumentType } from "@/types";
import { getPromptForDocumentType } from "./prompts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBA08uQbEvdsHa7fIXv19tsFmYrFshUDFs";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

export async function extractDataFromDocument(
  fileBase64: string,
  mimeType: string,
  documentType: DocumentType
): Promise<unknown> {
  const prompt = getPromptForDocumentType(documentType);

  const requestBody = {
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
