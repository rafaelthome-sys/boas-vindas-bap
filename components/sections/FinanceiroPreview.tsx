"use client";

import { FinanceiroData } from "@/types";
import { ExtractedInfoCard, InfoItem } from "../ExtractedInfoCard";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { ConsumoChart } from "../charts/ConsumoChart";
import { DespesasChart } from "../charts/DespesasChart";

interface FinanceiroPreviewProps {
  data: FinanceiroData;
}

export function FinanceiroPreview({ data }: FinanceiroPreviewProps) {
  const isSuperavit = data.movimentoPeriodo?.tipoResultado === "superavit";
  const hasConsumoData = data.consumoMensal && (
    (data.consumoMensal.agua?.length ?? 0) > 0 ||
    (data.consumoMensal.energia?.length ?? 0) > 0 ||
    (data.consumoMensal.gas?.length ?? 0) > 0
  );
  const hasPosicaoFinanceira = data.posicaoFinanceira?.contas?.length > 0;

  return (
    <div className="space-y-4">
      <ExtractedInfoCard title="Posição Financeira">
        <InfoItem label="Período" value={data.periodoReferencia} />

        {hasPosicaoFinanceira ? (
          <>
            <div className="mt-2 space-y-1">
              {data.posicaoFinanceira.contas.map((conta, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{conta.nome}</span>
                  <span className="font-medium">{formatCurrency(conta.saldo || 0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total Geral</span>
              <span className="text-bap-primary">{formatCurrency(data.posicaoFinanceira.totalGeral || 0)}</span>
            </div>
          </>
        ) : (
          <>
            <InfoItem label="Saldo em conta" value={formatCurrency(data.saldoConta || 0)} />
            <InfoItem label="Fundo de reserva" value={formatCurrency(data.valorFundoReserva || 0)} />
            <InfoItem
              label="Total disponível"
              value={formatCurrency(data.totalRecursosDisponiveis || 0)}
            />
          </>
        )}
      </ExtractedInfoCard>

      {data.movimentoPeriodo && (
        <ExtractedInfoCard title="Movimento do Período">
          <InfoItem
            label="Receitas"
            value={formatCurrency(data.movimentoPeriodo.totalReceitas || 0)}
          />
          <InfoItem
            label="Despesas"
            value={formatCurrency(data.movimentoPeriodo.totalDespesas || 0)}
          />
          <div className="flex items-center gap-2 mt-2">
            {isSuperavit ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={
                isSuperavit ? "text-green-600 font-medium" : "text-red-600 font-medium"
              }
            >
              {isSuperavit ? "Superávit" : "Déficit"}:{" "}
              {formatCurrency(Math.abs(data.movimentoPeriodo.resultado || 0))}
            </span>
          </div>
        </ExtractedInfoCard>
      )}

      {hasConsumoData && (
        <ExtractedInfoCard title="Consumo Mensal">
          <p className="text-xs text-gray-500 mb-2">Evolução de gastos com utilidades</p>
          <ConsumoChart
            agua={data.consumoMensal?.agua}
            energia={data.consumoMensal?.energia}
            gas={data.consumoMensal?.gas}
          />
        </ExtractedInfoCard>
      )}

      {data.consumoUtilidades && (
        <ExtractedInfoCard title="Consumo e Utilidades">
          <div className="space-y-2">
            {data.consumoUtilidades.aguaEsgoto > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Água e Esgoto</span>
                <span className="font-medium">{formatCurrency(data.consumoUtilidades.aguaEsgoto)}</span>
              </div>
            )}
            {data.consumoUtilidades.energiaEletrica > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Energia Elétrica</span>
                <span className="font-medium">{formatCurrency(data.consumoUtilidades.energiaEletrica)}</span>
              </div>
            )}
            {data.consumoUtilidades.gas && data.consumoUtilidades.gas > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gás</span>
                <span className="font-medium">{formatCurrency(data.consumoUtilidades.gas)}</span>
              </div>
            )}
            {data.consumoUtilidades.outros && data.consumoUtilidades.outros > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Outros</span>
                <span className="font-medium">{formatCurrency(data.consumoUtilidades.outros)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-bap-primary">{formatCurrency(data.consumoUtilidades.total)}</span>
            </div>
          </div>
        </ExtractedInfoCard>
      )}

      {data.despesasPorCategoria && data.despesasPorCategoria.length > 0 && (
        <ExtractedInfoCard title="Despesas por Categoria">
          <p className="text-xs text-gray-500 mb-2">Distribuição de despesas anuais</p>
          <DespesasChart despesas={data.despesasPorCategoria} />
        </ExtractedInfoCard>
      )}

      {data.inadimplencia && (
        <ExtractedInfoCard title="Inadimplência">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-amber-600">
              Total: {formatCurrency(data.inadimplencia.totalInadimplente || 0)}
            </span>
            {data.inadimplencia.percentualInadimplencia && (
              <span className="text-xs text-gray-500">
                ({data.inadimplencia.percentualInadimplencia}%)
              </span>
            )}
          </div>

          {data.inadimplencia.unidadesInadimplentes?.length > 0 && (
            <div className="space-y-1 text-sm">
              <div className="grid grid-cols-2 gap-2 font-medium text-gray-600 text-xs border-b pb-1">
                <span>Unidade</span>
                <span>Valor</span>
              </div>
              {data.inadimplencia.unidadesInadimplentes.slice(0, 5).map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 text-xs">
                  <span>{item.unidade}</span>
                  <span className="text-red-600">{formatCurrency(item.valorDevido || 0)}</span>
                </div>
              ))}
              {data.inadimplencia.unidadesInadimplentes.length > 5 && (
                <p className="text-xs text-gray-400 mt-1">
                  +{data.inadimplencia.unidadesInadimplentes.length - 5} unidades...
                </p>
              )}
            </div>
          )}
        </ExtractedInfoCard>
      )}
    </div>
  );
}
