import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
  ImageRun,
} from "docx";
import { RelatorioBoasVindas } from "@/types";
import fs from "fs";
import path from "path";

function getLogoBuffer(): Buffer | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo-bap.png");
    return fs.readFileSync(logoPath);
  } catch {
    return null;
  }
}

const BAP_BLUE = "1E3A8A";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function createHeading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1): Paragraph {
  return new Paragraph({
    heading: level,
    children: [
      new TextRun({
        text,
        bold: true,
        color: BAP_BLUE,
        size: level === HeadingLevel.HEADING_1 ? 32 : 26,
      }),
    ],
    spacing: { before: 400, after: 200 },
  });
}

function createSubheading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        color: "333333",
        size: 22,
      }),
    ],
    spacing: { before: 300, after: 100 },
  });
}

function createParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 22,
      }),
    ],
    spacing: { after: 100 },
  });
}

function createLabelValue(label: string, value: string | number | null | undefined): Paragraph {
  if (value === null || value === undefined || value === "") return new Paragraph({});
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        size: 22,
      }),
      new TextRun({
        text: String(value),
        size: 22,
      }),
    ],
    spacing: { after: 80 },
  });
}

function createInfoTable(data: Array<{ label: string; value: string }>): Table {
  const rows = data.map(
    (item) =>
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: item.label, bold: true, size: 20 })],
              }),
            ],
            width: { size: 35, type: WidthType.PERCENTAGE },
            shading: { fill: "F8FAFC" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: item.value, size: 20 })],
              }),
            ],
            width: { size: 65, type: WidthType.PERCENTAGE },
          }),
        ],
      })
  );

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
    },
  });
}

export async function generateWordReport(data: RelatorioBoasVindas): Promise<Buffer> {
  const sections: (Paragraph | Table)[] = [];
  const logoBuffer = getLogoBuffer();

  // Logo BAP
  if (logoBuffer) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 150,
              height: 61,
            },
            type: "png",
          }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // Título principal
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "RELATÓRIO DE BOAS VINDAS",
          bold: true,
          color: BAP_BLUE,
          size: 48,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Panorama de Gestão do Condomínio",
          color: "666666",
          size: 28,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // Data de geração
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Gerado em ${formatDate(data.dataGeracao)} por ${data.geradoPor}`,
          color: "999999",
          size: 20,
          italics: true,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // CARTA DE APRESENTAÇÃO
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Logo na carta de apresentação
  if (logoBuffer) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 150,
              height: 61,
            },
            type: "png",
          }),
        ],
        spacing: { after: 400 },
      })
    );
  }

  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Carta de Apresentação",
          bold: true,
          color: BAP_BLUE,
          size: 36,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  const greetingText = data.nomeSindico
    ? `Prezado(a) ${data.nomeSindico},`
    : "Prezado(a) Síndico(a),";

  sections.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: greetingText,
          size: 24,
          bold: true,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: "É com grande satisfação que apresentamos este Relatório de Boas Vindas, elaborado especialmente para auxiliar no início da sua gestão condominial.",
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: "Acreditamos que o acesso a informações claras e organizadas é fundamental para uma administração eficiente e transparente. Este documento reúne os principais dados do condomínio, extraídos cuidadosamente dos documentos fornecidos, oferecendo uma visão completa do panorama atual da gestão.",
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: "A BAP Condomínios e Imóveis é uma empresa que preza pela parceria constante, pela troca de informações e pela proximidade genuína com nossos clientes. Nossa missão é estar ao seu lado em cada etapa, fornecendo suporte, orientação e as ferramentas necessárias para o sucesso da sua gestão.",
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: "Conte sempre com a BAP. Estamos aqui para construir uma parceria sólida e duradoura, baseada na confiança, na transparência e no compromisso com a excelência.",
          size: 22,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: "Seja bem-vindo(a) e bom trabalho!",
          size: 22,
          italics: true,
        }),
      ],
      spacing: { after: 500 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "Atenciosamente,",
          size: 22,
        }),
      ],
      spacing: { after: 150 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "Time BAP",
          size: 26,
          bold: true,
          color: BAP_BLUE,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "BAP Condomínios e Imóveis",
          size: 20,
          color: "666666",
        }),
      ],
      spacing: { after: 600 },
    })
  );

  // CONVENÇÃO
  if (data.convencao) {
    sections.push(createHeading("1. DADOS DO CONDOMÍNIO"));

    if (data.convencao.identificacao) {
      sections.push(createSubheading("Identificação"));
      const identData = [
        { label: "Nome", value: data.convencao.identificacao.nomeCondominio || "" },
        { label: "Endereço", value: data.convencao.identificacao.endereco || "" },
        { label: "CNPJ", value: data.convencao.identificacao.cnpj || "" },
        { label: "Tipo", value: data.convencao.identificacao.tipoCondominio || "" },
        { label: "Total de Unidades", value: String(data.convencao.identificacao.quantidadeUnidades || "") },
        { label: "Total de Blocos", value: String(data.convencao.identificacao.quantidadeBlocos || "") },
        { label: "Área do Empreendimento", value: data.convencao.identificacao.areaEmpreendimento || "" },
      ].filter((d) => d.value);
      if (identData.length > 0) {
        sections.push(createInfoTable(identData));
      }
    }

    if (data.convencao.estrutural) {
      sections.push(createSubheading("Estrutura Física"));
      const estrutData = [
        { label: "Quantidade de Blocos", value: String(data.convencao.estrutural.quantidadeBlocos || "") },
        { label: "Quantidade de Unidades", value: String(data.convencao.estrutural.quantidadeUnidades || "") },
        { label: "Áreas Comuns", value: String(data.convencao.estrutural.quantidadeAreasComuns || "") },
      ].filter((d) => d.value);
      if (estrutData.length > 0) {
        sections.push(createInfoTable(estrutData));
      }

      if (data.convencao.estrutural.areasComuns?.length > 0) {
        sections.push(createParagraph("Principais áreas comuns: " + data.convencao.estrutural.areasComuns.join(", ")));
      }

      if (data.convencao.estrutural.descricaoFisica) {
        sections.push(createParagraph(data.convencao.estrutural.descricaoFisica));
      }
    }

    if (data.convencao.regrasAssembleia) {
      sections.push(createSubheading("Regras de Assembleia"));
      const regrasData = [
        { label: "Periodicidade AGO", value: data.convencao.regrasAssembleia.periodicidadeAGO || "" },
        { label: "Prazo de Convocação", value: data.convencao.regrasAssembleia.prazoMinimoConvocacao || "" },
        { label: "Intervalo entre Chamadas", value: data.convencao.regrasAssembleia.intervaloChamadas || "" },
        { label: "Quórum 1ª Chamada", value: data.convencao.regrasAssembleia.quorumPrimeiraChamada || "" },
        { label: "Quórum 2ª Chamada", value: data.convencao.regrasAssembleia.quorumSegundaChamada || "" },
        { label: "Quórum Obras Necessárias", value: data.convencao.regrasAssembleia.quorumObrasNecessarias || "" },
        { label: "Quórum Alteração Convenção", value: data.convencao.regrasAssembleia.quorumAlteracaoConvencao || "" },
      ].filter((d) => d.value);
      if (regrasData.length > 0) {
        sections.push(createInfoTable(regrasData));
      }
    }

    if (data.convencao.regrasFinanceiras) {
      sections.push(createSubheading("Regras Financeiras"));
      const finData = [
        { label: "Vencimento da Cota", value: data.convencao.regrasFinanceiras.dataVencimentoCota || "" },
        { label: "Multa por Atraso", value: data.convencao.regrasFinanceiras.percentualMultaAtraso || "" },
        { label: "Fundo de Reserva", value: data.convencao.regrasFinanceiras.percentualFundoReserva || "" },
      ].filter((d) => d.value);
      if (finData.length > 0) {
        sections.push(createInfoTable(finData));
      }
    }
  }

  // GOVERNANÇA (ATAS)
  if (data.atas) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(createHeading("2. GOVERNANÇA"));

    if (data.atas.governanca) {
      if (data.atas.governanca.sindico?.nome) {
        sections.push(createSubheading("Síndico"));
        const sindicoData = [
          { label: "Nome", value: data.atas.governanca.sindico.nome || "" },
          { label: "Unidade", value: data.atas.governanca.sindico.unidade || "" },
          { label: "Mandato", value: data.atas.governanca.sindico.periodoMandato || "" },
        ].filter((d) => d.value);
        sections.push(createInfoTable(sindicoData));
      }

      if (data.atas.governanca.subsindico?.nome) {
        sections.push(createSubheading("Subsíndico"));
        const subData = [
          { label: "Nome", value: data.atas.governanca.subsindico.nome || "" },
          { label: "Unidade", value: data.atas.governanca.subsindico.unidade || "" },
        ].filter((d) => d.value);
        sections.push(createInfoTable(subData));
      }

      if (data.atas.governanca.conselho?.length > 0) {
        sections.push(createSubheading("Conselho"));
        data.atas.governanca.conselho.forEach((membro) => {
          const tipo = membro.presidente ? " (Presidente)" : membro.tipoParticipacao === "suplente" ? " (Suplente)" : "";
          sections.push(createParagraph(`• ${membro.nome} - ${membro.unidade}${tipo}`));
        });
      }
    }

    if (data.atas.cotaCondominial) {
      sections.push(createSubheading("Cota Condominial"));
      const cotaData = [
        { label: "Valor Atual", value: formatCurrency(data.atas.cotaCondominial.valorTaxa) },
        { label: "Reajuste Aprovado", value: data.atas.cotaCondominial.existeReajusteAprovado ? "Sim" : "Não" },
        { label: "Valor Após Reajuste", value: formatCurrency(data.atas.cotaCondominial.valorTotalAposReajuste) },
        { label: "Fundo de Reserva", value: data.atas.cotaCondominial.percentualFundoReserva || "" },
      ].filter((d) => d.value && d.value !== "N/A");
      if (cotaData.length > 0) {
        sections.push(createInfoTable(cotaData));
      }
    }

    if (data.atas.deliberacoes) {
      if (data.atas.deliberacoes.resumoAGO) {
        sections.push(createSubheading("Deliberações AGO"));
        sections.push(createParagraph(data.atas.deliberacoes.resumoAGO));
      }
      if (data.atas.deliberacoes.resumoAGE) {
        sections.push(createSubheading("Deliberações AGE"));
        sections.push(createParagraph(data.atas.deliberacoes.resumoAGE));
      }
    }
  }

  // FINANCEIRO
  if (data.financeiro) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(createHeading("3. SITUAÇÃO FINANCEIRA"));

    sections.push(createSubheading("Posição Financeira"));

    if (data.financeiro.periodoReferencia) {
      sections.push(createParagraph(`Período: ${data.financeiro.periodoReferencia}`));
    }

    // Posição financeira detalhada
    if (data.financeiro.posicaoFinanceira?.contas?.length > 0) {
      const posicaoData = data.financeiro.posicaoFinanceira.contas.map((conta) => ({
        label: conta.nome,
        value: formatCurrency(conta.saldo),
      }));
      posicaoData.push({
        label: "TOTAL GERAL",
        value: formatCurrency(data.financeiro.posicaoFinanceira.totalGeral),
      });
      sections.push(createInfoTable(posicaoData));
    } else {
      const finData = [
        { label: "Saldo em Conta", value: formatCurrency(data.financeiro.saldoConta) },
        { label: "Fundo de Reserva", value: formatCurrency(data.financeiro.valorFundoReserva) },
        { label: "Total Disponível", value: formatCurrency(data.financeiro.totalRecursosDisponiveis) },
      ].filter((d) => d.value && d.value !== "N/A");
      if (finData.length > 0) {
        sections.push(createInfoTable(finData));
      }
    }

    if (data.financeiro.movimentoPeriodo) {
      sections.push(createSubheading("Movimento do Período"));
      const movData = [
        { label: "Total de Receitas", value: formatCurrency(data.financeiro.movimentoPeriodo.totalReceitas) },
        { label: "Total de Despesas", value: formatCurrency(data.financeiro.movimentoPeriodo.totalDespesas) },
        {
          label: "Resultado",
          value: `${data.financeiro.movimentoPeriodo.tipoResultado === "superavit" ? "Superávit" : "Déficit"} de ${formatCurrency(Math.abs(data.financeiro.movimentoPeriodo.resultado))}`,
        },
      ].filter((d) => d.value && d.value !== "N/A");
      if (movData.length > 0) {
        sections.push(createInfoTable(movData));
      }
    }

    // Consumo e Utilidades
    if (data.financeiro.consumoUtilidades) {
      sections.push(createSubheading("Consumo e Utilidades"));
      const consumoData = [];
      if (data.financeiro.consumoUtilidades.aguaEsgoto > 0) {
        consumoData.push({ label: "Água e Esgoto", value: formatCurrency(data.financeiro.consumoUtilidades.aguaEsgoto) });
      }
      if (data.financeiro.consumoUtilidades.energiaEletrica > 0) {
        consumoData.push({ label: "Energia Elétrica", value: formatCurrency(data.financeiro.consumoUtilidades.energiaEletrica) });
      }
      if (data.financeiro.consumoUtilidades.gas && data.financeiro.consumoUtilidades.gas > 0) {
        consumoData.push({ label: "Gás", value: formatCurrency(data.financeiro.consumoUtilidades.gas) });
      }
      if (data.financeiro.consumoUtilidades.outros && data.financeiro.consumoUtilidades.outros > 0) {
        consumoData.push({ label: "Outros", value: formatCurrency(data.financeiro.consumoUtilidades.outros) });
      }
      consumoData.push({ label: "TOTAL", value: formatCurrency(data.financeiro.consumoUtilidades.total) });
      sections.push(createInfoTable(consumoData));
    }

    // Despesas por Categoria
    if (data.financeiro.despesasPorCategoria && data.financeiro.despesasPorCategoria.length > 0) {
      sections.push(createSubheading("Despesas por Categoria"));

      const sortedDespesas = [...data.financeiro.despesasPorCategoria]
        .filter(d => d.valor > 0)
        .sort((a, b) => b.valor - a.valor);

      const despesasData = sortedDespesas.map(d => ({
        label: d.categoria,
        value: formatCurrency(d.valor),
      }));

      if (despesasData.length > 0) {
        sections.push(createInfoTable(despesasData));
      }
    }

    // Consumo Mensal
    if (data.financeiro.consumoMensal) {
      const { agua, energia, gas } = data.financeiro.consumoMensal;
      const hasConsumo = (agua?.length ?? 0) > 0 || (energia?.length ?? 0) > 0 || (gas?.length ?? 0) > 0;

      if (hasConsumo) {
        sections.push(createSubheading("Consumo Mensal"));

        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        meses.forEach((mes) => {
          const aguaVal = agua?.find(d => d.mes === mes)?.valor;
          const energiaVal = energia?.find(d => d.mes === mes)?.valor;
          const gasVal = gas?.find(d => d.mes === mes)?.valor;

          if (aguaVal || energiaVal || gasVal) {
            let text = `${mes}: `;
            const parts = [];
            if (aguaVal) parts.push(`Água ${formatCurrency(aguaVal)}`);
            if (energiaVal) parts.push(`Energia ${formatCurrency(energiaVal)}`);
            if (gasVal) parts.push(`Gás ${formatCurrency(gasVal)}`);
            text += parts.join(" | ");
            sections.push(createParagraph(text));
          }
        });
      }
    }

    // Inadimplência
    if (data.financeiro.inadimplencia) {
      sections.push(createSubheading("Inadimplência"));
      const inadData = [
        { label: "Total Inadimplente", value: formatCurrency(data.financeiro.inadimplencia.totalInadimplente) },
      ];
      if (data.financeiro.inadimplencia.percentualInadimplencia) {
        inadData.push({ label: "Percentual", value: `${data.financeiro.inadimplencia.percentualInadimplencia}%` });
      }
      sections.push(createInfoTable(inadData));

      if (data.financeiro.inadimplencia.unidadesInadimplentes?.length > 0) {
        sections.push(createParagraph("Unidades inadimplentes:"));
        data.financeiro.inadimplencia.unidadesInadimplentes.forEach((item) => {
          sections.push(createParagraph(`• ${item.unidade}: ${formatCurrency(item.valorDevido)}`));
        });
      }
    }
  }

  // CERTIDÕES
  if (data.certidoes && data.certidoes.certidoes?.length > 0) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(createHeading("4. CERTIDÕES E REGULARIDADE"));

    data.certidoes.certidoes.forEach((cert) => {
      const certData = [
        { label: "Tipo", value: cert.tipo || "" },
        { label: "Situação", value: cert.situacao ? cert.situacao.charAt(0).toUpperCase() + cert.situacao.slice(1) : "" },
        { label: "Validade", value: cert.dataValidade || "" },
        { label: "Observação", value: cert.observacao || "" },
      ].filter((d) => d.value);
      if (certData.length > 0) {
        sections.push(createInfoTable(certData));
        sections.push(new Paragraph({ spacing: { after: 200 } }));
      }
    });
  }

  // DEPARTAMENTO PESSOAL
  if (data.departamentoPessoal) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(createHeading("5. DEPARTAMENTO PESSOAL"));

    sections.push(
      createParagraph(
        data.departamentoPessoal.possuiFuncionariosProprios
          ? "O condomínio possui funcionários próprios."
          : "O condomínio não possui funcionários próprios."
      )
    );

    if (data.departamentoPessoal.funcionarios?.length > 0) {
      sections.push(createSubheading("Quadro de Funcionários"));
      data.departamentoPessoal.funcionarios.forEach((func) => {
        const cargo = func.cargo ? ` (${func.cargo})` : "";
        const extras = func.horasExtras > 0 ? ` - ${func.horasExtras}h extras` : "";
        sections.push(createParagraph(`• ${func.nome}${cargo} - ${formatCurrency(func.salario)}${extras}`));
      });
    }

    if (data.departamentoPessoal.custoTotalFolha > 0) {
      sections.push(createLabelValue("Custo Total da Folha", formatCurrency(data.departamentoPessoal.custoTotalFolha)));
    }
  }

  // JURÍDICO
  if (data.juridico) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(createHeading("6. SITUAÇÃO JURÍDICA"));

    if (data.juridico.processos?.length > 0) {
      sections.push(createParagraph(`Foram identificados ${data.juridico.processos.length} processo(s):`));

      data.juridico.processos.forEach((proc, i) => {
        sections.push(createSubheading(`Processo ${i + 1}`));
        const procData = [
          { label: "Número", value: proc.identificacao || "" },
          { label: "Tipo", value: proc.tipo || "" },
          { label: "Parte Contrária", value: proc.parteContraria || "" },
          { label: "Descrição", value: proc.descricao || "" },
          { label: "Status", value: proc.status || "" },
          { label: "Valor da Causa", value: proc.valorCausa ? formatCurrency(proc.valorCausa) : "" },
          { label: "Observação", value: proc.observacao || "" },
        ].filter((d) => d.value);
        if (procData.length > 0) {
          sections.push(createInfoTable(procData));
        }
      });
    } else {
      sections.push(createParagraph("Nenhum processo judicial identificado."));
    }
  }

  // OUTROS DOCUMENTOS
  if (data.outros && data.outros.documentos?.length > 0) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(createHeading("7. OUTROS DOCUMENTOS"));

    data.outros.documentos.forEach((doc, index) => {
      sections.push(createSubheading(doc.tipoDocumento || `Documento ${index + 1}`));

      if (doc.titulo) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: doc.titulo,
                bold: true,
                color: BAP_BLUE,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      if (doc.resumo) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: doc.resumo,
                size: 22,
                italics: true,
              }),
            ],
            spacing: { after: 150 },
          })
        );
      }

      if (doc.itensImportantes?.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Itens Importantes:",
                bold: true,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { before: 100, after: 50 },
          })
        );

        doc.itensImportantes.forEach((item) => {
          sections.push(createParagraph(`• ${item}`));
        });
      }

      if (doc.observacoes) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Observação: ",
                bold: true,
                size: 20,
                color: "D97706",
              }),
              new TextRun({
                text: doc.observacoes,
                size: 20,
                color: "D97706",
              }),
            ],
            spacing: { before: 100, after: 200 },
          })
        );
      }

      sections.push(new Paragraph({ spacing: { after: 200 } }));
    });
  }

  // Rodapé
  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "_______________________________________________",
          color: "CCCCCC",
          size: 20,
        }),
      ],
      spacing: { before: 600 },
    })
  );
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Relatório gerado pelo Sistema Boas Vindas BAP",
          color: "999999",
          size: 18,
          italics: true,
        }),
      ],
      spacing: { before: 200 },
    })
  );
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "BAP Condomínios e Imóveis",
          color: BAP_BLUE,
          size: 20,
          bold: true,
        }),
      ],
      spacing: { before: 100 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
