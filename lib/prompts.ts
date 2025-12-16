import { DocumentType } from "@/types";

export const EXTRACTION_PROMPTS: Record<DocumentType, string> = {
  convencao: `Você é um especialista em análise de documentos de condomínios. Analise o documento de CONVENÇÃO DO CONDOMÍNIO fornecido e extraia as seguintes informações em formato JSON.

IMPORTANTE:
- Retorne APENAS o JSON válido, sem markdown, sem explicações, sem texto adicional.
- O sistema suporta MÚLTIPLOS DOCUMENTOS por seção - extraia TODAS as informações encontradas neste documento.
- Se alguma informação não estiver disponível, use null para esse campo.

{
  "identificacao": {
    "nomeCondominio": "nome completo do condomínio",
    "endereco": "endereço completo",
    "cnpj": "número do CNPJ se disponível",
    "quantidadeUnidades": número total de unidades,
    "quantidadeBlocos": número de blocos,
    "tipoCondominio": "residencial" ou "comercial" ou "misto",
    "areaEmpreendimento": "área total do empreendimento/terreno em m² (ex: 5.000 m²)"
  },
  "estrutural": {
    "quantidadeBlocos": número,
    "quantidadeUnidades": número,
    "quantidadeAreasComuns": número de áreas comuns,
    "areasComuns": ["lista", "de", "todas", "áreas", "comuns", "encontradas"],
    "descricaoFisica": "descrição de elementos físicos como terreno, entradas, taludes"
  },
  "regrasAssembleia": {
    "periodicidadeAGO": "periodicidade da assembleia ordinária",
    "prazoMinimoConvocacao": "prazo mínimo para convocação",
    "intervaloChamadas": "intervalo entre primeira e segunda chamadas",
    "quorumPrimeiraChamada": "quórum para primeira chamada",
    "quorumSegundaChamada": "quórum para segunda chamada",
    "quorumObrasNecessarias": "quórum para aprovação de obras necessárias",
    "quorumAlteracaoConvencao": "quórum para alteração da convenção"
  },
  "regrasFinanceiras": {
    "dataVencimentoCota": "data de vencimento da cota condominial",
    "percentualMultaAtraso": "percentual de multa por atraso",
    "percentualFundoReserva": "percentual de contribuição ao fundo de reserva"
  }
}`,

  financeiro: `Você é um especialista em análise financeira de condomínios. Analise o documento FINANCEIRO fornecido (prestação de contas, demonstrativo do realizado, previsão orçamentária, balancete) e extraia as seguintes informações em formato JSON.

IMPORTANTE:
- Retorne APENAS o JSON válido, sem markdown, sem explicações, sem texto adicional.
- O sistema suporta MÚLTIPLOS DOCUMENTOS financeiros - extraia TODAS as informações deste documento.
- Os dados serão MESCLADOS automaticamente com outros documentos da mesma seção.
- EXTRAIA TUDO que encontrar - não omita dados!

PRIORIDADE DOS DOCUMENTOS:
- PRESTAÇÃO DE CONTAS: Contém a SITUAÇÃO ATUAL (saldos, posição financeira, inadimplência) - dados mais importantes!
- DEMONSTRATIVO DO REALIZADO: Contém dados HISTÓRICOS (despesas mensais, consumo por mês)
- Sempre extraia os dados mais recentes/atuais quando disponíveis

{
  "periodoReferencia": "período de referência das informações (ex: Janeiro/2024, Ano 2024)",
  "posicaoFinanceira": {
    "contas": [
      {"nome": "Nome da Conta/Fundo", "saldo": valor numérico}
    ],
    "totalGeral": valor numérico da soma de todas as contas
  },
  "saldoConta": valor numérico do saldo principal em conta,
  "valorFundoReserva": valor numérico do fundo de reserva,
  "totalRecursosDisponiveis": valor numérico total de recursos disponíveis,
  "movimentoPeriodo": {
    "totalReceitas": valor numérico total das receitas do período,
    "totalDespesas": valor numérico total das despesas do período,
    "resultado": valor numérico do resultado (positivo para superávit, negativo para déficit),
    "tipoResultado": "superavit" ou "deficit"
  },
  "inadimplencia": {
    "totalInadimplente": valor total em aberto,
    "percentualInadimplencia": percentual de inadimplência se disponível,
    "unidadesInadimplentes": [
      {"unidade": "identificação", "valorDevido": valor numérico}
    ]
  },
  "consumoMensal": {
    "agua": [{"mes": "Jan", "valor": número}, {"mes": "Fev", "valor": número}, ...],
    "energia": [{"mes": "Jan", "valor": número}, {"mes": "Fev", "valor": número}, ...],
    "gas": [{"mes": "Jan", "valor": número}, {"mes": "Fev", "valor": número}, ...]
  },
  "consumoUtilidades": {
    "aguaEsgoto": valor numérico total gasto com água e esgoto no período,
    "energiaEletrica": valor numérico total gasto com energia elétrica no período,
    "gas": valor numérico total gasto com gás no período (se houver),
    "outros": valor numérico de outros consumos/utilidades (se houver),
    "total": valor numérico total da categoria Consumo e Utilidades
  },
  "despesasPorCategoria": [
    {"categoria": "nome da categoria", "valor": valor total}
  ]
}

INSTRUÇÕES CRÍTICAS PARA EXTRAÇÃO:

1. POSIÇÃO FINANCEIRA:
   - Extraia TODAS as contas/fundos com seus saldos
   - Inclua: Condomínio, Fundo de Obras, Fundo de Reserva, ou qualquer outra conta
   - Some todos os saldos para totalGeral

2. INADIMPLÊNCIA:
   - Extraia TODAS as unidades inadimplentes com valores devidos
   - Liste cada unidade separadamente

3. CONSUMO MENSAL (para gráficos de linha):
   - Procure por tabelas com gastos MENSAIS de água, energia/luz, gás
   - Pode aparecer como "Demonstrativo do Realizado", "Despesas Mensais", "Consumo Mensal"
   - Procure colunas com meses (Jan, Fev, Mar... ou Janeiro, Fevereiro...) e valores
   - ÁGUA: COPASA, CAESB, SABESP, água e esgoto → extraia para "agua"
   - ENERGIA: CEMIG, CPFL, Eletropaulo, energia elétrica, luz → extraia para "energia"
   - GÁS: Comgás, gás natural, gás canalizado → extraia para "gas"
   - Use abreviações: Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez
   - Se não encontrar dados mensais detalhados, retorne null

4. CONSUMO E UTILIDADES (totais do período):
   - Procure pela categoria/seção "Consumo e Utilidades" ou "Consumo"
   - Extraia os valores TOTAIS (anuais ou do período):
     * "Água e Esgoto" ou "Água" → aguaEsgoto
     * "Energia Elétrica" ou "Luz" → energiaEletrica
     * "Gás" ou "Gás Natural" → gas
     * Outros itens de consumo → outros
   - Some todos para "total"

5. DESPESAS POR CATEGORIA (para gráfico de barras):
   - Extraia TODAS as categorias de despesas encontradas
   - Exemplos: Pessoal, Mão de Obra, Limpeza, Manutenção, Consumo e Utilidades, Contratos, Administração, Seguros, etc.
   - Use os nomes das categorias EXATAMENTE como aparecem no documento
   - Inclua o valor TOTAL de cada categoria

6. VALORES:
   - Sempre números sem R$, sem pontos de milhar
   - Use ponto como separador decimal (ex: 1234.56)`,

  atas: `Você é um especialista em análise de atas de assembleia de condomínios. Analise a ATA DE ASSEMBLEIA (AGO ou AGE) fornecida e extraia as seguintes informações em formato JSON.

IMPORTANTE:
- Retorne APENAS o JSON válido, sem markdown, sem explicações, sem texto adicional.
- O sistema suporta MÚLTIPLAS ATAS - extraia TODAS as informações desta ata.
- Os dados serão MESCLADOS automaticamente (conselheiros combinados, deliberações separadas por tipo).
- Se for AGO, preencha resumoAGO. Se for AGE, preencha resumoAGE.

{
  "governanca": {
    "gestaoAtual": "identificação da gestão atual (ex: Gestão 2024/2025)",
    "sindico": {
      "nome": "nome completo do síndico",
      "unidade": "unidade/apartamento do síndico",
      "periodoMandato": "período do mandato"
    },
    "subsindico": {
      "nome": "nome do subsíndico",
      "unidade": "unidade do subsíndico"
    },
    "conselho": [
      {
        "nome": "nome do conselheiro",
        "unidade": "unidade",
        "tipoParticipacao": "efetivo" ou "suplente",
        "presidente": true ou false
      }
    ]
  },
  "cotaCondominial": {
    "existeCotaVigente": true ou false,
    "valorTaxa": valor numérico da taxa condominial,
    "existeReajusteAprovado": true ou false,
    "percentualFundoReserva": "percentual destinado ao fundo",
    "valorAdicionalFundoReserva": valor adicional se houver,
    "valorTotalAposReajuste": valor após reajuste se aplicável
  },
  "deliberacoes": {
    "resumoAGO": "breve resumo das principais deliberações aprovadas (se for AGO)",
    "resumoAGE": "breve resumo das principais deliberações aprovadas (se for AGE)"
  }
}

INSTRUÇÕES:
- Extraia TODOS os membros do conselho encontrados na ata
- Identifique se é AGO ou AGE pelo título/cabeçalho da ata
- Se não encontrar uma informação, use null`,

  certidoes: `Você é um especialista em análise de certidões. Analise a CERTIDÃO ou documento com certidões fornecido e extraia as seguintes informações em formato JSON.

IMPORTANTE:
- Retorne APENAS o JSON válido, sem markdown, sem explicações, sem texto adicional.
- O sistema suporta MÚLTIPLOS DOCUMENTOS de certidões - extraia TODAS as certidões deste documento.
- Os dados serão MESCLADOS automaticamente (certidões de diferentes documentos serão combinadas).
- EXTRAIA CADA CERTIDÃO SEPARADAMENTE no array.

{
  "certidoes": [
    {
      "tipo": "tipo completo da certidão (ex: Certidão Negativa de Débitos Federais, CND FGTS, CNDT)",
      "situacao": "regular" ou "negativa" ou "positiva",
      "dataValidade": "data de validade no formato DD/MM/AAAA",
      "observacao": "detalhes importantes, irregularidades, ou se problema é anterior à gestão atual"
    }
  ]
}

INSTRUÇÕES CRÍTICAS:

1. TIPOS COMUNS DE CERTIDÕES:
   - CND Federal (Receita Federal / PGFN)
   - CND Estadual (SEFAZ)
   - CND Municipal (ISS, IPTU)
   - CND FGTS (Caixa Econômica Federal)
   - CNDT (Certidão Negativa de Débitos Trabalhistas)
   - Certidão de Regularidade do INSS
   - Certidão do Corpo de Bombeiros
   - Certidão de Habite-se
   - AVCB (Auto de Vistoria do Corpo de Bombeiros)

2. SITUAÇÃO:
   - "negativa" = sem pendências/débitos (situação OK)
   - "positiva" = com pendências/débitos/irregularidades (ATENÇÃO)
   - "regular" = em situação regular

3. OBSERVAÇÃO (MUITO IMPORTANTE):
   - Se a certidão estiver POSITIVA, descreva:
     * Qual é a irregularidade/débito
     * Valor se disponível
     * Se há datas que indiquem que o problema é ANTERIOR à gestão atual da BAP
   - Isso é importante para contextualizar problemas herdados

4. Se o documento contiver MÚLTIPLAS certidões, liste TODAS separadamente no array`,

  departamentoPessoal: `Você é um especialista em análise de documentos de departamento pessoal. Analise o documento de DEPARTAMENTO PESSOAL fornecido e extraia as seguintes informações em formato JSON.

IMPORTANTE:
- Retorne APENAS o JSON válido, sem markdown, sem explicações, sem texto adicional.
- O sistema suporta MÚLTIPLOS DOCUMENTOS - extraia TODOS os funcionários deste documento.
- Os dados serão MESCLADOS automaticamente (funcionários de diferentes documentos serão combinados).

{
  "possuiFuncionariosProprios": true ou false,
  "funcionarios": [
    {
      "nome": "nome completo do funcionário",
      "cargo": "cargo ou função",
      "salario": valor numérico do salário,
      "horasExtras": quantidade de horas extras se houver
    }
  ],
  "custoTotalFolha": valor numérico do custo total com folha de pagamentos
}

INSTRUÇÕES:
- Liste TODOS os funcionários encontrados no documento
- Se não houver funcionários próprios, retorne array vazio em "funcionarios"
- Valores monetários devem ser números sem formatação (sem R$, sem pontos de milhar)
- Use ponto como separador decimal`,

  juridico: `Você é um especialista em análise de documentos jurídicos. Analise o documento JURÍDICO fornecido e extraia as seguintes informações em formato JSON.

IMPORTANTE:
- Retorne APENAS o JSON válido, sem markdown, sem explicações, sem texto adicional.
- O sistema suporta MÚLTIPLOS DOCUMENTOS jurídicos - extraia TODOS os processos deste documento.
- Os dados serão MESCLADOS automaticamente (processos de diferentes documentos serão combinados).

{
  "processos": [
    {
      "identificacao": "número completo do processo (ex: 0001234-56.2024.8.13.0000)",
      "tipo": "tipo do processo (ex: Cobrança, Trabalhista, Cível, Execução Fiscal)",
      "parteContraria": "nome da parte contrária",
      "descricao": "breve descrição do processo e do que se trata",
      "status": "status atual (ex: em andamento, arquivado, aguardando julgamento, fase de execução)",
      "valorCausa": valor numérico se disponível,
      "observacao": "informações adicionais relevantes"
    }
  ]
}

INSTRUÇÕES:
- Liste TODOS os processos encontrados no documento
- Se não houver processos, retorne array vazio
- Inclua número completo do processo para identificação única
- Valores monetários devem ser números sem formatação`,

  outros: `Você é um especialista em análise de documentos diversos. Analise o documento fornecido (pode ser apólice de seguro, contrato, laudo, orçamento, ou qualquer outro documento relevante para gestão condominial) e extraia as informações mais importantes em formato JSON.

IMPORTANTE:
- Retorne APENAS o JSON válido, sem markdown, sem explicações, sem texto adicional.
- O sistema suporta MÚLTIPLOS DOCUMENTOS - cada documento será adicionado à lista.
- IDENTIFIQUE o tipo de documento automaticamente.

{
  "documentos": [
    {
      "tipoDocumento": "tipo do documento (ex: Apólice de Seguro, Contrato de Manutenção, Laudo Técnico, Orçamento)",
      "titulo": "título ou identificação do documento",
      "resumo": "resumo conciso do documento em 2-3 frases explicando do que se trata",
      "itensImportantes": [
        "item importante 1",
        "item importante 2",
        "item importante 3"
      ],
      "observacoes": "observações relevantes ou pontos de atenção"
    }
  ]
}

INSTRUÇÕES POR TIPO DE DOCUMENTO:

1. SEGUROS (Apólice):
   - Seguradora e número da apólice
   - Vigência (início e fim)
   - Coberturas principais e valores
   - Valor do prêmio
   - Franquias

2. CONTRATOS:
   - Partes envolvidas (contratante e contratado)
   - Objeto do contrato
   - Valor e forma de pagamento
   - Vigência
   - Obrigações principais

3. LAUDOS TÉCNICOS:
   - Tipo de laudo (elétrico, estrutural, para-raios, etc.)
   - Data da vistoria
   - Conclusões principais
   - Recomendações
   - Responsável técnico (nome e registro)

4. ORÇAMENTOS:
   - Empresa
   - Serviços/produtos
   - Valores (unitários e total)
   - Condições de pagamento
   - Validade do orçamento

5. OUTROS:
   - Identifique o tipo e extraia informações relevantes para a gestão condominial
   - Seja objetivo e foque no que é útil para o síndico`,
};

export function getPromptForDocumentType(type: DocumentType): string {
  return EXTRACTION_PROMPTS[type] || "";
}
