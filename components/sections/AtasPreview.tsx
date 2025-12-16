"use client";

import { AtasData } from "@/types";
import { ExtractedInfoCard, InfoItem } from "../ExtractedInfoCard";
import { formatCurrency } from "@/lib/utils";

interface AtasPreviewProps {
  data: AtasData;
}

export function AtasPreview({ data }: AtasPreviewProps) {
  return (
    <div className="space-y-4">
      {data.governanca && (
        <ExtractedInfoCard title="Governança">
          <InfoItem label="Gestão" value={data.governanca.gestaoAtual} />
          {data.governanca.sindico && (
            <>
              <InfoItem label="Síndico" value={data.governanca.sindico.nome} />
              <InfoItem label="Unidade" value={data.governanca.sindico.unidade} />
              <InfoItem label="Mandato" value={data.governanca.sindico.periodoMandato} />
            </>
          )}
          {data.governanca.subsindico?.nome && (
            <InfoItem
              label="Subsíndico"
              value={`${data.governanca.subsindico.nome} (${data.governanca.subsindico.unidade})`}
            />
          )}
          {data.governanca.conselho?.length > 0 && (
            <div className="mt-2">
              <span className="text-gray-400 text-xs">Conselho:</span>
              <ul className="list-disc list-inside text-xs mt-1">
                {data.governanca.conselho.map((membro, i) => (
                  <li key={i}>
                    {membro.nome} - {membro.unidade}
                    {membro.presidente && " (Presidente)"}
                    {membro.tipoParticipacao === "suplente" && " (Suplente)"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ExtractedInfoCard>
      )}

      {data.cotaCondominial && (
        <ExtractedInfoCard title="Cota Condominial">
          <InfoItem
            label="Valor atual"
            value={formatCurrency(data.cotaCondominial.valorTaxa || 0)}
          />
          {data.cotaCondominial.existeReajusteAprovado && (
            <InfoItem
              label="Após reajuste"
              value={formatCurrency(data.cotaCondominial.valorTotalAposReajuste || 0)}
            />
          )}
          <InfoItem
            label="Fundo reserva"
            value={data.cotaCondominial.percentualFundoReserva}
          />
        </ExtractedInfoCard>
      )}

      {data.deliberacoes && (
        <ExtractedInfoCard title="Deliberações">
          {data.deliberacoes.resumoAGO && (
            <div className="text-xs">
              <span className="font-medium">AGO:</span> {data.deliberacoes.resumoAGO}
            </div>
          )}
          {data.deliberacoes.resumoAGE && (
            <div className="text-xs mt-1">
              <span className="font-medium">AGE:</span> {data.deliberacoes.resumoAGE}
            </div>
          )}
        </ExtractedInfoCard>
      )}
    </div>
  );
}
