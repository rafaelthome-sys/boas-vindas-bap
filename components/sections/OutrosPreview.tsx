"use client";

import { OutrosData } from "@/types";
import { ExtractedInfoCard } from "../ExtractedInfoCard";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";

interface OutrosPreviewProps {
  data: OutrosData;
}

export function OutrosPreview({ data }: OutrosPreviewProps) {
  if (!data.documentos || data.documentos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.documentos.map((doc, index) => (
        <ExtractedInfoCard key={index} title={doc.tipoDocumento || "Documento"}>
          <div className="space-y-3">
            {doc.titulo && (
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-bap-primary mt-0.5" />
                <span className="text-sm font-medium text-gray-700">{doc.titulo}</span>
              </div>
            )}

            {doc.resumo && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {doc.resumo}
              </p>
            )}

            {doc.itensImportantes && doc.itensImportantes.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Itens Importantes:</p>
                <ul className="space-y-1">
                  {doc.itensImportantes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {doc.observacoes && (
              <div className="flex items-start gap-2 bg-amber-50 p-2 rounded">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  <span className="font-medium">Obs:</span> {doc.observacoes}
                </p>
              </div>
            )}
          </div>
        </ExtractedInfoCard>
      ))}
    </div>
  );
}
