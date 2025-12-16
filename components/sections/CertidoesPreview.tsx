"use client";

import { CertidoesData } from "@/types";
import { ExtractedInfoCard } from "../ExtractedInfoCard";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface CertidoesPreviewProps {
  data: CertidoesData;
}

export function CertidoesPreview({ data }: CertidoesPreviewProps) {
  if (!data.certidoes || data.certidoes.length === 0) {
    return null;
  }

  const getStatusIcon = (situacao: string) => {
    switch (situacao) {
      case "negativa":
      case "regular":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "positiva":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (situacao: string) => {
    switch (situacao) {
      case "negativa":
      case "regular":
        return "text-green-600";
      case "positiva":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <ExtractedInfoCard title="Certidões Identificadas">
      <div className="space-y-2">
        {data.certidoes.map((cert, index) => (
          <div
            key={index}
            className="p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(cert.situacao)}
                <span className="text-sm font-medium text-gray-700">{cert.tipo}</span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium ${getStatusColor(cert.situacao)}`}>
                  {cert.situacao.charAt(0).toUpperCase() + cert.situacao.slice(1)}
                </span>
                {cert.dataValidade && (
                  <p className="text-xs text-gray-400">Válida até: {cert.dataValidade}</p>
                )}
              </div>
            </div>
            {cert.observacao && (
              <p className="text-xs text-amber-600 mt-1 pl-5 italic">
                Obs: {cert.observacao}
              </p>
            )}
          </div>
        ))}
      </div>
    </ExtractedInfoCard>
  );
}
