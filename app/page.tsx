"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { DocumentSection } from "@/components/DocumentSection";
import { ConvencaoPreview } from "@/components/sections/ConvencaoPreview";
import { FinanceiroPreview } from "@/components/sections/FinanceiroPreview";
import { AtasPreview } from "@/components/sections/AtasPreview";
import { CertidoesPreview } from "@/components/sections/CertidoesPreview";
import { DepartamentoPessoalPreview } from "@/components/sections/DepartamentoPessoalPreview";
import { JuridicoPreview } from "@/components/sections/JuridicoPreview";
import { OutrosPreview } from "@/components/sections/OutrosPreview";
import { generateId } from "@/lib/utils";
import {
  DocumentType,
  UploadedFile,
  ConvencaoData,
  FinanceiroData,
  AtasData,
  CertidoesData,
  DepartamentoPessoalData,
  JuridicoData,
  OutrosData,
  RelatorioBoasVindas,
} from "@/types";
import { FileDown, Loader2, User } from "lucide-react";

interface SectionConfig {
  id: DocumentType;
  title: string;
  description: string;
  color: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: "convencao",
    title: "Convenção",
    description: "Convenção do condomínio",
    color: "blue",
  },
  {
    id: "atas",
    title: "Atas de Assembleia",
    description: "AGO e AGE",
    color: "green",
  },
  {
    id: "financeiro",
    title: "Documentos Financeiros",
    description: "Prestação de contas e previsão orçamentária",
    color: "yellow",
  },
  {
    id: "certidoes",
    title: "Certidões",
    description: "Certidões negativas e de regularidade",
    color: "purple",
  },
  {
    id: "departamentoPessoal",
    title: "Departamento Pessoal",
    description: "Folha de pagamento e funcionários",
    color: "orange",
  },
  {
    id: "juridico",
    title: "Jurídico",
    description: "Processos e documentos jurídicos",
    color: "red",
  },
  {
    id: "outros",
    title: "Outros Documentos",
    description: "Seguros, contratos, laudos e outros",
    color: "gray",
  },
];

type ExtractedDataMap = {
  convencao: ConvencaoData | null;
  financeiro: FinanceiroData | null;
  atas: AtasData | null;
  certidoes: CertidoesData | null;
  departamentoPessoal: DepartamentoPessoalData | null;
  juridico: JuridicoData | null;
  outros: OutrosData | null;
};

export default function HomePage() {
  const [files, setFiles] = useState<Record<DocumentType, UploadedFile[]>>({
    convencao: [],
    atas: [],
    financeiro: [],
    certidoes: [],
    departamentoPessoal: [],
    juridico: [],
    outros: [],
  });

  const [extractedData, setExtractedData] = useState<ExtractedDataMap>({
    convencao: null,
    financeiro: null,
    atas: null,
    certidoes: null,
    departamentoPessoal: null,
    juridico: null,
    outros: null,
  });

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [sindicoName, setSindicoName] = useState("");

  const processFile = useCallback(async (file: File, documentType: DocumentType, fileId: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao processar");
      }

      setFiles((prev) => ({
        ...prev,
        [documentType]: prev[documentType].map((f) =>
          f.id === fileId
            ? { ...f, status: "completed" as const, extractedData: result.data }
            : f
        ),
      }));

      setExtractedData((prev) => {
        const existingData = prev[documentType];

        // Se não há dados existentes, apenas adiciona
        if (!existingData) {
          return {
            ...prev,
            [documentType]: result.data,
          };
        }

        // FINANCEIRO - prioriza dados mais recentes (prestação de contas) para situação atual
        // Combina dados históricos (despesas, consumo) de múltiplos documentos
        if (documentType === "financeiro") {
          const newData = result.data as FinanceiroData;
          const existing = existingData as FinanceiroData;

          // Mescla despesas por categoria (combina arrays de todos os documentos)
          let mergedDespesas = existing.despesasPorCategoria || [];
          if (newData.despesasPorCategoria?.length) {
            const existingCats = mergedDespesas.map(d => d.categoria.toLowerCase());
            newData.despesasPorCategoria.forEach(newDespesa => {
              if (!existingCats.includes(newDespesa.categoria.toLowerCase())) {
                mergedDespesas = [...mergedDespesas, newDespesa];
              }
            });
          }

          // Para SITUAÇÃO ATUAL (posição financeira, saldos, inadimplência):
          // SEMPRE preferir dados novos se existirem - prestação de contas tem dados mais atuais
          // Para DADOS HISTÓRICOS (consumo mensal, despesas por categoria):
          // Manter o que já existe ou usar novos se não existir

          return {
            ...prev,
            [documentType]: {
              // Período: preferir o mais recente
              periodoReferencia: newData.periodoReferencia || existing.periodoReferencia,

              // SITUAÇÃO ATUAL - sempre preferir dados novos (prestação de contas)
              posicaoFinanceira: newData.posicaoFinanceira?.contas?.length
                ? newData.posicaoFinanceira
                : existing.posicaoFinanceira,
              saldoConta: newData.saldoConta ?? existing.saldoConta,
              valorFundoReserva: newData.valorFundoReserva ?? existing.valorFundoReserva,
              totalRecursosDisponiveis: newData.totalRecursosDisponiveis ?? existing.totalRecursosDisponiveis,

              // Movimento do período - preferir dados novos
              movimentoPeriodo: newData.movimentoPeriodo?.totalReceitas != null
                ? newData.movimentoPeriodo
                : existing.movimentoPeriodo,

              // Inadimplência - SEMPRE preferir dados novos (mais atuais)
              inadimplencia: newData.inadimplencia?.totalInadimplente != null
                ? newData.inadimplencia
                : existing.inadimplencia,

              // DADOS HISTÓRICOS - manter existentes, complementar com novos
              consumoMensal: existing.consumoMensal?.agua?.length || existing.consumoMensal?.energia?.length
                ? existing.consumoMensal
                : newData.consumoMensal,
              consumoUtilidades: existing.consumoUtilidades?.total
                ? existing.consumoUtilidades
                : newData.consumoUtilidades,
              despesasPorCategoria: mergedDespesas.length > 0 ? mergedDespesas : undefined,
            } as FinanceiroData,
          };
        }

        // CERTIDÕES - concatena arrays de certidões de múltiplos documentos
        if (documentType === "certidoes") {
          const newData = result.data as CertidoesData;
          const existing = existingData as CertidoesData;

          // Combina certidões, evitando duplicatas pelo tipo
          const existingCerts = existing.certidoes || [];
          const newCerts = newData.certidoes || [];
          const allCerts = [...existingCerts];

          newCerts.forEach((newCert) => {
            const exists = allCerts.some(
              (c) => c.tipo.toLowerCase() === newCert.tipo.toLowerCase()
            );
            if (!exists) {
              allCerts.push(newCert);
            }
          });

          return {
            ...prev,
            [documentType]: { certidoes: allCerts } as CertidoesData,
          };
        }

        // JURÍDICO - concatena arrays de processos
        if (documentType === "juridico") {
          const newData = result.data as JuridicoData;
          const existing = existingData as JuridicoData;

          const existingProcs = existing.processos || [];
          const newProcs = newData.processos || [];
          const allProcs = [...existingProcs];

          newProcs.forEach((newProc) => {
            const exists = allProcs.some(
              (p) => p.identificacao === newProc.identificacao
            );
            if (!exists) {
              allProcs.push(newProc);
            }
          });

          return {
            ...prev,
            [documentType]: { processos: allProcs } as JuridicoData,
          };
        }

        // OUTROS - concatena arrays de documentos
        if (documentType === "outros") {
          const newData = result.data as OutrosData;
          const existing = existingData as OutrosData;

          const existingDocs = existing.documentos || [];
          const newDocs = newData.documentos || [];

          return {
            ...prev,
            [documentType]: { documentos: [...existingDocs, ...newDocs] } as OutrosData,
          };
        }

        // DEPARTAMENTO PESSOAL - mescla funcionários
        if (documentType === "departamentoPessoal") {
          const newData = result.data as DepartamentoPessoalData;
          const existing = existingData as DepartamentoPessoalData;

          const existingFuncs = existing.funcionarios || [];
          const newFuncs = newData.funcionarios || [];
          const allFuncs = [...existingFuncs];

          newFuncs.forEach((newFunc) => {
            const exists = allFuncs.some(
              (f) => f.nome.toLowerCase() === newFunc.nome.toLowerCase()
            );
            if (!exists) {
              allFuncs.push(newFunc);
            }
          });

          return {
            ...prev,
            [documentType]: {
              possuiFuncionariosProprios: newData.possuiFuncionariosProprios || existing.possuiFuncionariosProprios,
              funcionarios: allFuncs,
              custoTotalFolha: newData.custoTotalFolha || existing.custoTotalFolha,
            } as DepartamentoPessoalData,
          };
        }

        // ATAS - mescla governança, mantém dados mais completos
        if (documentType === "atas") {
          const newData = result.data as AtasData;
          const existing = existingData as AtasData;

          // Mescla conselho (evita duplicatas)
          const existingConselho = existing.governanca?.conselho || [];
          const newConselho = newData.governanca?.conselho || [];
          const allConselho = [...existingConselho];

          newConselho.forEach((newMembro) => {
            const exists = allConselho.some(
              (m) => m.nome.toLowerCase() === newMembro.nome.toLowerCase()
            );
            if (!exists) {
              allConselho.push(newMembro);
            }
          });

          return {
            ...prev,
            [documentType]: {
              governanca: {
                gestaoAtual: newData.governanca?.gestaoAtual || existing.governanca?.gestaoAtual,
                sindico: newData.governanca?.sindico?.nome
                  ? newData.governanca.sindico
                  : existing.governanca?.sindico,
                subsindico: newData.governanca?.subsindico?.nome
                  ? newData.governanca.subsindico
                  : existing.governanca?.subsindico,
                conselho: allConselho,
              },
              cotaCondominial: newData.cotaCondominial?.valorTaxa
                ? newData.cotaCondominial
                : existing.cotaCondominial,
              deliberacoes: {
                resumoAGO: newData.deliberacoes?.resumoAGO || existing.deliberacoes?.resumoAGO,
                resumoAGE: newData.deliberacoes?.resumoAGE || existing.deliberacoes?.resumoAGE,
              },
            } as AtasData,
          };
        }

        // CONVENÇÃO - mescla campos, mantém o mais completo
        if (documentType === "convencao") {
          const newData = result.data as ConvencaoData;
          const existing = existingData as ConvencaoData;

          return {
            ...prev,
            [documentType]: {
              identificacao: {
                nomeCondominio: newData.identificacao?.nomeCondominio || existing.identificacao?.nomeCondominio,
                endereco: newData.identificacao?.endereco || existing.identificacao?.endereco,
                cnpj: newData.identificacao?.cnpj || existing.identificacao?.cnpj,
                quantidadeUnidades: newData.identificacao?.quantidadeUnidades || existing.identificacao?.quantidadeUnidades,
                quantidadeBlocos: newData.identificacao?.quantidadeBlocos || existing.identificacao?.quantidadeBlocos,
                tipoCondominio: newData.identificacao?.tipoCondominio || existing.identificacao?.tipoCondominio,
                areaEmpreendimento: newData.identificacao?.areaEmpreendimento || existing.identificacao?.areaEmpreendimento,
              },
              estrutural: {
                quantidadeBlocos: newData.estrutural?.quantidadeBlocos || existing.estrutural?.quantidadeBlocos,
                quantidadeUnidades: newData.estrutural?.quantidadeUnidades || existing.estrutural?.quantidadeUnidades,
                quantidadeAreasComuns: newData.estrutural?.quantidadeAreasComuns || existing.estrutural?.quantidadeAreasComuns,
                areasComuns: newData.estrutural?.areasComuns?.length
                  ? newData.estrutural.areasComuns
                  : existing.estrutural?.areasComuns,
                descricaoFisica: newData.estrutural?.descricaoFisica || existing.estrutural?.descricaoFisica,
              },
              regrasAssembleia: {
                periodicidadeAGO: newData.regrasAssembleia?.periodicidadeAGO || existing.regrasAssembleia?.periodicidadeAGO,
                prazoMinimoConvocacao: newData.regrasAssembleia?.prazoMinimoConvocacao || existing.regrasAssembleia?.prazoMinimoConvocacao,
                intervaloChamadas: newData.regrasAssembleia?.intervaloChamadas || existing.regrasAssembleia?.intervaloChamadas,
                quorumPrimeiraChamada: newData.regrasAssembleia?.quorumPrimeiraChamada || existing.regrasAssembleia?.quorumPrimeiraChamada,
                quorumSegundaChamada: newData.regrasAssembleia?.quorumSegundaChamada || existing.regrasAssembleia?.quorumSegundaChamada,
                quorumObrasNecessarias: newData.regrasAssembleia?.quorumObrasNecessarias || existing.regrasAssembleia?.quorumObrasNecessarias,
                quorumAlteracaoConvencao: newData.regrasAssembleia?.quorumAlteracaoConvencao || existing.regrasAssembleia?.quorumAlteracaoConvencao,
              },
              regrasFinanceiras: {
                dataVencimentoCota: newData.regrasFinanceiras?.dataVencimentoCota || existing.regrasFinanceiras?.dataVencimentoCota,
                percentualMultaAtraso: newData.regrasFinanceiras?.percentualMultaAtraso || existing.regrasFinanceiras?.percentualMultaAtraso,
                percentualFundoReserva: newData.regrasFinanceiras?.percentualFundoReserva || existing.regrasFinanceiras?.percentualFundoReserva,
              },
            } as ConvencaoData,
          };
        }

        // Fallback - substitui
        return {
          ...prev,
          [documentType]: result.data,
        };
      });
    } catch (error) {
      setFiles((prev) => ({
        ...prev,
        [documentType]: prev[documentType].map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error" as const,
                error: error instanceof Error ? error.message : "Erro desconhecido",
              }
            : f
        ),
      }));
    }
  }, []);

  const handleFilesAdded = useCallback(
    (documentType: DocumentType) => (newFiles: File[]) => {
      const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "processing" as const,
      }));

      setFiles((prev) => ({
        ...prev,
        [documentType]: [...prev[documentType], ...uploadedFiles],
      }));

      uploadedFiles.forEach((uf) => {
        processFile(uf.file, documentType, uf.id);
      });
    },
    [processFile]
  );

  const handleFileRemove = useCallback(
    (documentType: DocumentType) => (fileId: string) => {
      setFiles((prev) => {
        const updated = {
          ...prev,
          [documentType]: prev[documentType].filter((f) => f.id !== fileId),
        };

        const remainingCompleted = updated[documentType].filter(
          (f) => f.status === "completed"
        );

        if (remainingCompleted.length === 0) {
          setExtractedData((prevData) => ({
            ...prevData,
            [documentType]: null,
          }));
        }

        return updated;
      });
    },
    []
  );

  const getPreviewComponent = (type: DocumentType) => {
    const data = extractedData[type];
    if (!data) return null;

    switch (type) {
      case "convencao":
        return <ConvencaoPreview data={data as ConvencaoData} />;
      case "financeiro":
        return <FinanceiroPreview data={data as FinanceiroData} />;
      case "atas":
        return <AtasPreview data={data as AtasData} />;
      case "certidoes":
        return <CertidoesPreview data={data as CertidoesData} />;
      case "departamentoPessoal":
        return <DepartamentoPessoalPreview data={data as DepartamentoPessoalData} />;
      case "juridico":
        return <JuridicoPreview data={data as JuridicoData} />;
      case "outros":
        return <OutrosPreview data={data as OutrosData} />;
      default:
        return null;
    }
  };

  const hasAnyData = Object.values(extractedData).some((d) => d !== null);

  const handleGenerateReport = async (format: "pdf" | "word") => {
    setIsGeneratingReport(true);

    try {
      const reportData: RelatorioBoasVindas = {
        dataGeracao: new Date().toISOString(),
        geradoPor: "Equipe BAP",
        nomeSindico: sindicoName || extractedData.atas?.governanca?.sindico?.nome || "",
        nomeCondominio: extractedData.convencao?.identificacao?.nomeCondominio || "",
        convencao: extractedData.convencao,
        financeiro: extractedData.financeiro,
        atas: extractedData.atas,
        certidoes: extractedData.certidoes,
        departamentoPessoal: extractedData.departamentoPessoal,
        juridico: extractedData.juridico,
        outros: extractedData.outros,
      };

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: reportData, format }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar relatório");
      }

      if (format === "word") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio-boas-vindas-${new Date().toISOString().split("T")[0]}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Para PDF, abre o HTML em uma nova janela para impressão
        const html = await response.text();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          // Aguarda o carregamento e abre diálogo de impressão
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 250);
          };
        }
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Relatório de Boas Vindas
          </h2>
          <p className="text-gray-500 mt-1">
            Faça upload dos documentos do condomínio para gerar o relatório de gestão
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((section) => (
            <DocumentSection
              key={section.id}
              id={section.id}
              title={section.title}
              description={section.description}
              icon={section.id}
              color={section.color}
              files={files[section.id]}
              onFilesAdded={handleFilesAdded(section.id)}
              onFileRemove={handleFileRemove(section.id)}
              extractedPreview={getPreviewComponent(section.id)}
              isProcessing={files[section.id].some((f) => f.status === "processing")}
            />
          ))}
        </div>

        {hasAnyData && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Gerar Relatório
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Preencha o nome do síndico e escolha o formato do relatório.
            </p>

            <div className="mb-6">
              <label htmlFor="sindicoName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nome do Síndico
              </label>
              <input
                type="text"
                id="sindicoName"
                value={sindicoName || extractedData.atas?.governanca?.sindico?.nome || ""}
                onChange={(e) => setSindicoName(e.target.value)}
                placeholder="Nome completo do síndico que receberá o relatório"
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
              {extractedData.atas?.governanca?.sindico?.nome && !sindicoName && (
                <p className="text-xs text-green-600 mt-1">
                  Preenchido automaticamente a partir das atas
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleGenerateReport("pdf")}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingReport ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileDown className="w-5 h-5" />
                )}
                Baixar PDF
              </button>
              <button
                onClick={() => handleGenerateReport("word")}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingReport ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileDown className="w-5 h-5" />
                )}
                Baixar Word
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          BAP Condomínios e Imóveis - Sistema Boas Vindas
        </div>
      </footer>
    </div>
  );
}
