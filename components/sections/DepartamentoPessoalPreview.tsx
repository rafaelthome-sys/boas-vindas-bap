"use client";

import { DepartamentoPessoalData } from "@/types";
import { ExtractedInfoCard, InfoItem } from "../ExtractedInfoCard";
import { formatCurrency } from "@/lib/utils";
import { Users, UserX } from "lucide-react";

interface DepartamentoPessoalPreviewProps {
  data: DepartamentoPessoalData;
}

export function DepartamentoPessoalPreview({ data }: DepartamentoPessoalPreviewProps) {
  return (
    <div className="space-y-4">
      <ExtractedInfoCard title="Quadro de Funcionários">
        <div className="flex items-center gap-2 mb-2">
          {data.possuiFuncionariosProprios ? (
            <>
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">
                Possui funcionários próprios
              </span>
            </>
          ) : (
            <>
              <UserX className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Não possui funcionários próprios
              </span>
            </>
          )}
        </div>

        {data.funcionarios && data.funcionarios.length > 0 && (
          <div className="space-y-2 mt-3">
            {data.funcionarios.map((func, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
              >
                <div>
                  <span className="font-medium text-gray-700">{func.nome}</span>
                  {func.cargo && (
                    <span className="text-xs text-gray-500 ml-2">({func.cargo})</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-gray-600">
                    {formatCurrency(func.salario || 0)}
                  </span>
                  {func.horasExtras > 0 && (
                    <span className="text-xs text-orange-500 ml-2">
                      +{func.horasExtras}h extras
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.custoTotalFolha > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <InfoItem
              label="Custo total da folha"
              value={formatCurrency(data.custoTotalFolha)}
            />
          </div>
        )}
      </ExtractedInfoCard>
    </div>
  );
}
