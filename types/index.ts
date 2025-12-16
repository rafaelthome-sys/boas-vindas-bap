// Tipos para Convenção do Condomínio
export interface ConvencaoData {
  identificacao: {
    nomeCondominio: string;
    endereco: string;
    cnpj: string;
    quantidadeUnidades: number;
    quantidadeBlocos: number;
    tipoCondominio: "residencial" | "comercial" | "misto" | "";
    areaEmpreendimento: string;
  };
  estrutural: {
    quantidadeBlocos: number;
    quantidadeUnidades: number;
    quantidadeAreasComuns: number;
    areasComuns: string[];
    descricaoFisica: string;
  };
  regrasAssembleia: {
    periodicidadeAGO: string;
    prazoMinimoConvocacao: string;
    intervaloChamadas: string;
    quorumPrimeiraChamada: string;
    quorumSegundaChamada: string;
    quorumObrasNecessarias: string;
    quorumAlteracaoConvencao: string;
  };
  regrasFinanceiras: {
    dataVencimentoCota: string;
    percentualMultaAtraso: string;
    percentualFundoReserva: string;
  };
}

// Tipos para dados mensais de consumo
export interface DadoMensal {
  mes: string;
  valor: number;
}

// Tipos para conta na posição financeira
export interface ContaFinanceira {
  nome: string;
  saldo: number;
}

// Tipos para inadimplência
export interface Inadimplencia {
  unidade: string;
  proprietario?: string;
  valorDevido: number;
  mesesAtraso?: number;
}

// Tipos para Documentos Financeiros
export interface FinanceiroData {
  periodoReferencia: string;
  // Posição financeira detalhada
  posicaoFinanceira: {
    contas: ContaFinanceira[];
    totalGeral: number;
  };
  // Campos legados (mantidos para compatibilidade)
  saldoConta: number;
  valorFundoReserva: number;
  totalRecursosDisponiveis: number;
  movimentoPeriodo: {
    totalReceitas: number;
    totalDespesas: number;
    resultado: number;
    tipoResultado: "superavit" | "deficit" | "";
  };
  // Inadimplência
  inadimplencia?: {
    totalInadimplente: number;
    percentualInadimplencia?: number;
    unidadesInadimplentes: Inadimplencia[];
  };
  // Dados mensais para gráficos
  consumoMensal?: {
    agua: DadoMensal[];
    energia: DadoMensal[];
    gas: DadoMensal[];
  };
  // Consumo e Utilidades - valores totais do período
  consumoUtilidades?: {
    aguaEsgoto: number;
    energiaEletrica: number;
    gas?: number;
    outros?: number;
    total: number;
  };
  despesasPorCategoria?: Array<{
    categoria: string;
    valor: number;
  }>;
}

// Tipos para Atas de Assembleia
export interface AtasData {
  governanca: {
    gestaoAtual: string;
    sindico: {
      nome: string;
      unidade: string;
      periodoMandato: string;
    };
    subsindico: {
      nome: string;
      unidade: string;
    };
    conselho: Array<{
      nome: string;
      unidade: string;
      tipoParticipacao: "efetivo" | "suplente";
      presidente: boolean;
    }>;
  };
  cotaCondominial: {
    existeCotaVigente: boolean;
    valorTaxa: number;
    existeReajusteAprovado: boolean;
    percentualFundoReserva: string;
    valorAdicionalFundoReserva: number;
    valorTotalAposReajuste: number;
  };
  deliberacoes: {
    resumoAGO: string;
    resumoAGE: string;
  };
}

// Tipos para Certidões
export interface CertidoesData {
  certidoes: Array<{
    tipo: string;
    situacao: "regular" | "negativa" | "positiva" | "";
    dataValidade: string;
    observacao?: string;
  }>;
}

// Tipos para Departamento Pessoal
export interface DepartamentoPessoalData {
  possuiFuncionariosProprios: boolean;
  funcionarios: Array<{
    nome: string;
    cargo?: string;
    salario: number;
    horasExtras: number;
  }>;
  custoTotalFolha: number;
}

// Tipos para Jurídico
export interface JuridicoData {
  processos: Array<{
    identificacao: string;
    tipo?: string;
    parteContraria?: string;
    descricao: string;
    status: string;
    valorCausa?: number;
    observacao?: string;
  }>;
}

// Tipos para Outros Documentos (Seguros, etc.)
export interface OutrosDocumento {
  tipoDocumento: string;
  titulo: string;
  resumo: string;
  itensImportantes: string[];
  observacoes?: string;
}

export interface OutrosData {
  documentos: OutrosDocumento[];
}

// Estrutura completa do relatório
export interface RelatorioBoasVindas {
  dataGeracao: string;
  geradoPor: string;
  nomeSindico: string;
  nomeCondominio: string;
  convencao: ConvencaoData | null;
  financeiro: FinanceiroData | null;
  atas: AtasData | null;
  certidoes: CertidoesData | null;
  departamentoPessoal: DepartamentoPessoalData | null;
  juridico: JuridicoData | null;
  outros: OutrosData | null;
}

// Tipos auxiliares
export type DocumentType =
  | "convencao"
  | "atas"
  | "financeiro"
  | "certidoes"
  | "departamentoPessoal"
  | "juridico"
  | "outros";

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: "pending" | "processing" | "completed" | "error";
  extractedData?: unknown;
  error?: string;
}

export interface DocumentSection {
  id: DocumentType;
  title: string;
  description: string;
  icon: string;
  color: string;
  files: UploadedFile[];
}

// Estado global da aplicação
export interface AppState {
  sections: Record<DocumentType, DocumentSection>;
  isGeneratingReport: boolean;
  reportData: RelatorioBoasVindas | null;
}
