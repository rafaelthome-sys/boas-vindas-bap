"use client";

import { ConvencaoData } from "@/types";
import { ExtractedInfoCard, InfoItem } from "../ExtractedInfoCard";

interface ConvencaoPreviewProps {
  data: ConvencaoData;
}

export function ConvencaoPreview({ data }: ConvencaoPreviewProps) {
  return (
    <div className="space-y-4">
      <ExtractedInfoCard title="Identificação">
        <InfoItem label="Nome" value={data.identificacao.nomeCondominio} />
        <InfoItem label="Endereço" value={data.identificacao.endereco} />
        <InfoItem label="CNPJ" value={data.identificacao.cnpj} />
        <InfoItem label="Tipo" value={data.identificacao.tipoCondominio} />
        <InfoItem label="Unidades" value={data.identificacao.quantidadeUnidades} />
        <InfoItem label="Blocos" value={data.identificacao.quantidadeBlocos} />
        <InfoItem label="Área" value={data.identificacao.areaEmpreendimento} />
      </ExtractedInfoCard>

      {data.estrutural && (
        <ExtractedInfoCard title="Estrutura">
          <InfoItem label="Áreas comuns" value={data.estrutural.quantidadeAreasComuns} />
          {data.estrutural.areasComuns?.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {data.estrutural.areasComuns.join(", ")}
            </div>
          )}
        </ExtractedInfoCard>
      )}

      {data.regrasFinanceiras && (
        <ExtractedInfoCard title="Regras Financeiras">
          <InfoItem label="Vencimento" value={data.regrasFinanceiras.dataVencimentoCota} />
          <InfoItem label="Multa" value={data.regrasFinanceiras.percentualMultaAtraso} />
          <InfoItem label="Fundo Reserva" value={data.regrasFinanceiras.percentualFundoReserva} />
        </ExtractedInfoCard>
      )}
    </div>
  );
}
