"use client";

import { JuridicoData } from "@/types";
import { ExtractedInfoCard } from "../ExtractedInfoCard";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface JuridicoPreviewProps {
  data: JuridicoData;
}

export function JuridicoPreview({ data }: JuridicoPreviewProps) {
  if (!data.processos || data.processos.length === 0) {
    return (
      <ExtractedInfoCard title="Situação Jurídica">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Nenhum processo identificado</span>
        </div>
      </ExtractedInfoCard>
    );
  }

  return (
    <ExtractedInfoCard title={`Processos Identificados (${data.processos.length})`}>
      <div className="space-y-3">
        {data.processos.map((processo, index) => (
          <div
            key={index}
            className="p-3 bg-red-50 border border-red-100 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {processo.identificacao}
                </p>
                {processo.tipo && (
                  <p className="text-xs text-blue-600 font-medium">{processo.tipo}</p>
                )}
                {processo.parteContraria && (
                  <p className="text-xs text-gray-500">vs. {processo.parteContraria}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">{processo.descricao}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {processo.status && (
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      {processo.status}
                    </span>
                  )}
                  {processo.valorCausa && (
                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                      {formatCurrency(processo.valorCausa)}
                    </span>
                  )}
                </div>
                {processo.observacao && (
                  <p className="text-xs text-gray-500 mt-2 italic">{processo.observacao}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ExtractedInfoCard>
  );
}
