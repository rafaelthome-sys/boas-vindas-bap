import { RelatorioBoasVindas } from "@/types";
import fs from "fs";
import path from "path";

function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo-bap.png");
    const logoBuffer = fs.readFileSync(logoPath);
    return logoBuffer.toString("base64");
  } catch {
    return "";
  }
}

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generatePdfHtml(data: RelatorioBoasVindas): string {
  const logoBase64 = getLogoBase64();
  const logoImg = logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" alt="BAP Logo" class="logo" />` : "";

  const nomeCondominio = data.nomeCondominio || "Condomínio";
  const nomeSindico = data.nomeSindico || "";

  // Formata o nome do arquivo: Nome_do_Condominio_Data
  const nomeArquivo = nomeCondominio
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "_") // Substitui espaços por underline
    .substring(0, 50); // Limita tamanho
  const dataFormatada = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const tituloDocumento = `${nomeArquivo}_${dataFormatada}`;

  let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${tituloDocumento}</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    @page :first {
      margin: 0;
    }
    @page :not(:first) {
      margin: 20mm 15mm 20mm 15mm;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.5;
      font-size: 11pt;
    }
    /* CAPA MODERNA */
    .cover-page {
      width: 210mm;
      height: 297mm;
      background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #1E3A8A 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }
    .cover-page::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/><circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/><circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/></svg>');
      background-size: 200px 200px;
      opacity: 0.3;
    }
    .cover-content {
      position: relative;
      z-index: 1;
      padding: 40px;
    }
    .cover-logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 50px;
      filter: brightness(0) invert(1);
    }
    .cover-badge {
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      padding: 8px 30px;
      border-radius: 50px;
      font-size: 11pt;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 30px;
      display: inline-block;
    }
    .cover-title {
      font-size: 42pt;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      max-width: 600px;
    }
    .cover-subtitle {
      font-size: 16pt;
      font-weight: 300;
      opacity: 0.9;
      margin-bottom: 60px;
      letter-spacing: 1px;
    }
    .cover-divider {
      width: 80px;
      height: 4px;
      background: rgba(255,255,255,0.5);
      margin: 0 auto 40px auto;
      border-radius: 2px;
    }
    .cover-info {
      font-size: 12pt;
      opacity: 0.8;
    }
    .cover-info .sindico {
      font-size: 14pt;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .cover-date {
      position: absolute;
      bottom: 40px;
      left: 0;
      right: 0;
      font-size: 10pt;
      opacity: 0.6;
    }
    .cover-corner {
      position: absolute;
      width: 150px;
      height: 150px;
      border: 3px solid rgba(255,255,255,0.1);
    }
    .cover-corner.top-left {
      top: 30px;
      left: 30px;
      border-right: none;
      border-bottom: none;
    }
    .cover-corner.bottom-right {
      bottom: 30px;
      right: 30px;
      border-left: none;
      border-top: none;
    }
    /* Restante do documento */
    .content-page {
      padding: 15mm;
    }

    /* CONTROLE DE QUEBRAS DE PÁGINA */
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #1E3A8A;
      font-size: 14pt;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #E5E7EB;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    .section h3 {
      color: #374151;
      font-size: 11pt;
      margin: 15px 0 10px 0;
      font-weight: 600;
      page-break-after: avoid;
      page-break-inside: avoid;
    }

    /* Tabelas - evitar quebras no meio */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 10pt;
      page-break-inside: avoid;
    }
    .info-table tr {
      page-break-inside: avoid;
    }
    .info-table td {
      padding: 8px 10px;
      border: 1px solid #E5E7EB;
      vertical-align: top;
      word-wrap: break-word;
    }
    .info-table td:first-child {
      background: #F8FAFC;
      font-weight: 600;
      width: 30%;
      color: #374151;
    }

    /* Listas */
    .list-item {
      padding: 4px 0;
      padding-left: 15px;
      font-size: 10pt;
    }
    .list-item:before {
      content: "•";
      margin-right: 6px;
      color: #1E3A8A;
    }

    /* Caixas de destaque - nunca quebrar */
    .highlight-box {
      background: #F0F9FF;
      border-left: 3px solid #1E3A8A;
      padding: 12px 14px;
      margin: 12px 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }
    .alert-box {
      background: #FEF2F2;
      border-left: 3px solid #DC2626;
      padding: 12px 14px;
      margin: 12px 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }
    .success-box {
      background: #F0FDF4;
      border-left: 3px solid #16A34A;
      padding: 12px 14px;
      margin: 12px 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }

    /* Certidões - grid que não quebra */
    .cert-item {
      page-break-inside: avoid;
      margin-bottom: 10px;
    }

    /* Processos e itens de lista complexos */
    .processo-item, .funcionario-item, .documento-item {
      page-break-inside: avoid;
      margin-bottom: 15px;
    }

    /* Gráficos - sempre em página inteira se possível */
    .chart-container {
      page-break-inside: avoid;
      margin: 15px 0;
      padding: 10px 0;
    }

    /* Subsections - evitar quebras */
    .subsection {
      page-break-inside: avoid;
      margin-bottom: 20px;
    }

    /* Rodapé */
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      color: #999;
      font-size: 9pt;
    }
    .footer .brand {
      color: #1E3A8A;
      font-weight: bold;
      margin-top: 4px;
    }
    .logo {
      max-width: 130px;
      height: auto;
      margin-bottom: 10px;
    }
    .logo-center {
      text-align: center;
      margin-bottom: 20px;
    }

    /* Controles explícitos de quebra */
    .page-break {
      page-break-before: always;
      padding-top: 20mm;
    }
    .page-break-after {
      page-break-after: always;
    }
    .avoid-break {
      page-break-inside: avoid;
    }
    .keep-together {
      page-break-inside: avoid;
      page-break-before: auto;
    }

    /* Orphans e widows - evitar linhas sozinhas */
    p, li, td {
      orphans: 3;
      widows: 3;
    }

    /* Carta de apresentação */
    .cover-letter {
      padding: 30px 40px;
      max-width: 100%;
      page-break-inside: avoid;
    }
    .cover-letter h2 {
      color: #1E3A8A;
      text-align: center;
      font-size: 18pt;
      margin-bottom: 25px;
    }
    .cover-letter .greeting {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 15px;
    }
    .cover-letter p {
      text-align: justify;
      margin-bottom: 14px;
      line-height: 1.8;
      font-size: 11pt;
    }
    .cover-letter .signature {
      text-align: right;
      margin-top: 35px;
      page-break-inside: avoid;
    }
    .cover-letter .signature .name {
      color: #1E3A8A;
      font-weight: bold;
      font-size: 14pt;
    }
    .cover-letter .signature .company {
      color: #666;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <!-- CAPA MODERNA -->
  <div class="cover-page">
    <div class="cover-corner top-left"></div>
    <div class="cover-corner bottom-right"></div>
    <div class="cover-content">
      ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" alt="BAP Logo" class="cover-logo" />` : ""}
      <div class="cover-badge">Relatório de Gestão</div>
      <h1 class="cover-title">${escapeHtml(nomeCondominio)}</h1>
      <div class="cover-subtitle">Boas Vindas à Nova Gestão</div>
      <div class="cover-divider"></div>
      ${nomeSindico ? `
      <div class="cover-info">
        <div class="sindico">Síndico(a): ${escapeHtml(nomeSindico)}</div>
      </div>
      ` : ""}
    </div>
    <div class="cover-date">${formatDate(data.dataGeracao)}</div>
  </div>

  <!-- CARTA DE APRESENTAÇÃO -->
  <div class="cover-letter">
    <div class="logo-center">${logoImg}</div>
    <h2>Carta de Apresentação</h2>
    <div class="greeting">${nomeSindico ? `Prezado(a) ${escapeHtml(nomeSindico)},` : "Prezado(a) Síndico(a),"}</div>
    <p>É com grande satisfação que apresentamos este Relatório de Boas Vindas, elaborado especialmente para auxiliar no início da sua gestão condominial.</p>
    <p>Acreditamos que o acesso a informações claras e organizadas é fundamental para uma administração eficiente e transparente. Este documento reúne os principais dados do condomínio, extraídos cuidadosamente dos documentos fornecidos, oferecendo uma visão completa do panorama atual da gestão.</p>
    <p>A BAP Condomínios e Imóveis é uma empresa que preza pela parceria constante, pela troca de informações e pela proximidade genuína com nossos clientes. Nossa missão é estar ao seu lado em cada etapa, fornecendo suporte, orientação e as ferramentas necessárias para o sucesso da sua gestão.</p>
    <p>Conte sempre com a BAP. Estamos aqui para construir uma parceria sólida e duradoura, baseada na confiança, na transparência e no compromisso com a excelência.</p>
    <p><em>Seja bem-vindo(a) e bom trabalho!</em></p>
    <div class="signature">
      <div>Atenciosamente,</div>
      <div class="name">Time BAP</div>
      <div class="company">BAP Condomínios e Imóveis</div>
    </div>
  </div>
`;

  // CONVENÇÃO
  if (data.convencao) {
    html += `<div class="section page-break">
      <h2>1. DADOS DO CONDOMÍNIO</h2>`;

    if (data.convencao.identificacao) {
      html += `<h3>Identificação</h3>
      <table class="info-table">`;

      if (data.convencao.identificacao.nomeCondominio)
        html += `<tr><td>Nome</td><td>${escapeHtml(data.convencao.identificacao.nomeCondominio)}</td></tr>`;
      if (data.convencao.identificacao.endereco)
        html += `<tr><td>Endereço</td><td>${escapeHtml(data.convencao.identificacao.endereco)}</td></tr>`;
      if (data.convencao.identificacao.cnpj)
        html += `<tr><td>CNPJ</td><td>${escapeHtml(data.convencao.identificacao.cnpj)}</td></tr>`;
      if (data.convencao.identificacao.tipoCondominio)
        html += `<tr><td>Tipo</td><td>${escapeHtml(data.convencao.identificacao.tipoCondominio)}</td></tr>`;
      if (data.convencao.identificacao.quantidadeUnidades)
        html += `<tr><td>Total de Unidades</td><td>${data.convencao.identificacao.quantidadeUnidades}</td></tr>`;
      if (data.convencao.identificacao.quantidadeBlocos)
        html += `<tr><td>Total de Blocos</td><td>${data.convencao.identificacao.quantidadeBlocos}</td></tr>`;
      if (data.convencao.identificacao.areaEmpreendimento)
        html += `<tr><td>Área do Empreendimento</td><td>${escapeHtml(data.convencao.identificacao.areaEmpreendimento)}</td></tr>`;

      html += `</table>`;
    }

    if (data.convencao.estrutural) {
      html += `<h3>Estrutura Física</h3>
      <table class="info-table">`;

      if (data.convencao.estrutural.quantidadeAreasComuns)
        html += `<tr><td>Áreas Comuns</td><td>${data.convencao.estrutural.quantidadeAreasComuns}</td></tr>`;

      html += `</table>`;

      if (data.convencao.estrutural.areasComuns?.length > 0) {
        html += `<div class="highlight-box">
          <strong>Principais áreas comuns:</strong> ${data.convencao.estrutural.areasComuns.map(escapeHtml).join(", ")}
        </div>`;
      }
    }

    if (data.convencao.regrasAssembleia) {
      html += `<h3>Regras de Assembleia</h3>
      <table class="info-table">`;

      if (data.convencao.regrasAssembleia.periodicidadeAGO)
        html += `<tr><td>Periodicidade AGO</td><td>${escapeHtml(data.convencao.regrasAssembleia.periodicidadeAGO)}</td></tr>`;
      if (data.convencao.regrasAssembleia.prazoMinimoConvocacao)
        html += `<tr><td>Prazo de Convocação</td><td>${escapeHtml(data.convencao.regrasAssembleia.prazoMinimoConvocacao)}</td></tr>`;
      if (data.convencao.regrasAssembleia.quorumPrimeiraChamada)
        html += `<tr><td>Quórum 1ª Chamada</td><td>${escapeHtml(data.convencao.regrasAssembleia.quorumPrimeiraChamada)}</td></tr>`;
      if (data.convencao.regrasAssembleia.quorumSegundaChamada)
        html += `<tr><td>Quórum 2ª Chamada</td><td>${escapeHtml(data.convencao.regrasAssembleia.quorumSegundaChamada)}</td></tr>`;

      html += `</table>`;
    }

    if (data.convencao.regrasFinanceiras) {
      html += `<h3>Regras Financeiras</h3>
      <table class="info-table">`;

      if (data.convencao.regrasFinanceiras.dataVencimentoCota)
        html += `<tr><td>Vencimento da Cota</td><td>${escapeHtml(data.convencao.regrasFinanceiras.dataVencimentoCota)}</td></tr>`;
      if (data.convencao.regrasFinanceiras.percentualMultaAtraso)
        html += `<tr><td>Multa por Atraso</td><td>${escapeHtml(data.convencao.regrasFinanceiras.percentualMultaAtraso)}</td></tr>`;
      if (data.convencao.regrasFinanceiras.percentualFundoReserva)
        html += `<tr><td>Fundo de Reserva</td><td>${escapeHtml(data.convencao.regrasFinanceiras.percentualFundoReserva)}</td></tr>`;

      html += `</table>`;
    }

    html += `</div>`;
  }

  // GOVERNANÇA (ATAS)
  if (data.atas) {
    html += `<div class="section page-break">
      <h2>2. GOVERNANÇA</h2>`;

    if (data.atas.governanca?.sindico?.nome) {
      html += `<h3>Síndico</h3>
      <table class="info-table">
        <tr><td>Nome</td><td>${escapeHtml(data.atas.governanca.sindico.nome)}</td></tr>`;
      if (data.atas.governanca.sindico.unidade)
        html += `<tr><td>Unidade</td><td>${escapeHtml(data.atas.governanca.sindico.unidade)}</td></tr>`;
      if (data.atas.governanca.sindico.periodoMandato)
        html += `<tr><td>Mandato</td><td>${escapeHtml(data.atas.governanca.sindico.periodoMandato)}</td></tr>`;
      html += `</table>`;
    }

    if (data.atas.governanca?.subsindico?.nome) {
      html += `<h3>Subsíndico</h3>
      <table class="info-table">
        <tr><td>Nome</td><td>${escapeHtml(data.atas.governanca.subsindico.nome)}</td></tr>
        <tr><td>Unidade</td><td>${escapeHtml(data.atas.governanca.subsindico.unidade)}</td></tr>
      </table>`;
    }

    if (data.atas.governanca?.conselho?.length > 0) {
      html += `<h3>Conselho</h3>`;
      data.atas.governanca.conselho.forEach((membro) => {
        const tipo = membro.presidente ? " (Presidente)" : membro.tipoParticipacao === "suplente" ? " (Suplente)" : "";
        html += `<div class="list-item">${escapeHtml(membro.nome)} - ${escapeHtml(membro.unidade)}${tipo}</div>`;
      });
    }

    if (data.atas.cotaCondominial) {
      html += `<h3>Cota Condominial</h3>
      <table class="info-table">`;
      if (data.atas.cotaCondominial.valorTaxa)
        html += `<tr><td>Valor Atual</td><td>${formatCurrency(data.atas.cotaCondominial.valorTaxa)}</td></tr>`;
      if (data.atas.cotaCondominial.existeReajusteAprovado && data.atas.cotaCondominial.valorTotalAposReajuste)
        html += `<tr><td>Valor Após Reajuste</td><td>${formatCurrency(data.atas.cotaCondominial.valorTotalAposReajuste)}</td></tr>`;
      if (data.atas.cotaCondominial.percentualFundoReserva)
        html += `<tr><td>Fundo de Reserva</td><td>${escapeHtml(data.atas.cotaCondominial.percentualFundoReserva)}</td></tr>`;
      html += `</table>`;
    }

    if (data.atas.deliberacoes?.resumoAGO) {
      html += `<h3>Deliberações AGO</h3>
      <div class="highlight-box">${escapeHtml(data.atas.deliberacoes.resumoAGO)}</div>`;
    }

    if (data.atas.deliberacoes?.resumoAGE) {
      html += `<h3>Deliberações AGE</h3>
      <div class="highlight-box">${escapeHtml(data.atas.deliberacoes.resumoAGE)}</div>`;
    }

    html += `</div>`;
  }

  // FINANCEIRO
  if (data.financeiro) {
    html += `<div class="section page-break">
      <h2>3. SITUAÇÃO FINANCEIRA</h2>
      <div class="subsection">
      <h3>Posição Financeira</h3>`;

    if (data.financeiro.periodoReferencia)
      html += `<p style="margin-bottom: 10px; color: #666;">Período: ${escapeHtml(data.financeiro.periodoReferencia)}</p>`;

    // Posição financeira detalhada
    if (data.financeiro.posicaoFinanceira?.contas?.length > 0) {
      html += `<table class="info-table">`;
      data.financeiro.posicaoFinanceira.contas.forEach((conta) => {
        html += `<tr><td>${escapeHtml(conta.nome)}</td><td>${formatCurrency(conta.saldo)}</td></tr>`;
      });
      html += `<tr style="background: #F0F9FF; font-weight: bold;">
        <td>Total Geral</td>
        <td>${formatCurrency(data.financeiro.posicaoFinanceira.totalGeral)}</td>
      </tr></table>`;
    } else {
      html += `<table class="info-table">`;
      if (data.financeiro.saldoConta)
        html += `<tr><td>Saldo em Conta</td><td>${formatCurrency(data.financeiro.saldoConta)}</td></tr>`;
      if (data.financeiro.valorFundoReserva)
        html += `<tr><td>Fundo de Reserva</td><td>${formatCurrency(data.financeiro.valorFundoReserva)}</td></tr>`;
      if (data.financeiro.totalRecursosDisponiveis)
        html += `<tr><td>Total Disponível</td><td>${formatCurrency(data.financeiro.totalRecursosDisponiveis)}</td></tr>`;
      html += `</table>`;
    }

    html += `</div>`; // fecha subsection posição financeira

    if (data.financeiro.movimentoPeriodo) {
      html += `<div class="subsection">
      <h3>Movimento do Período</h3>
      <table class="info-table">
        <tr><td>Total de Receitas</td><td>${formatCurrency(data.financeiro.movimentoPeriodo.totalReceitas)}</td></tr>
        <tr><td>Total de Despesas</td><td>${formatCurrency(data.financeiro.movimentoPeriodo.totalDespesas)}</td></tr>
      </table>`;

      const isSuperavit = data.financeiro.movimentoPeriodo.tipoResultado === "superavit";
      html += `<div class="${isSuperavit ? "success-box" : "alert-box"}">
        <strong>Resultado:</strong> ${isSuperavit ? "Superávit" : "Déficit"} de ${formatCurrency(Math.abs(data.financeiro.movimentoPeriodo.resultado))}
      </div></div>`; // fecha subsection movimento
    }

    // Consumo e Utilidades
    if (data.financeiro.consumoUtilidades) {
      html += `<h3>Consumo e Utilidades</h3>
      <table class="info-table">`;
      if (data.financeiro.consumoUtilidades.aguaEsgoto > 0)
        html += `<tr><td>Água e Esgoto</td><td>${formatCurrency(data.financeiro.consumoUtilidades.aguaEsgoto)}</td></tr>`;
      if (data.financeiro.consumoUtilidades.energiaEletrica > 0)
        html += `<tr><td>Energia Elétrica</td><td>${formatCurrency(data.financeiro.consumoUtilidades.energiaEletrica)}</td></tr>`;
      if (data.financeiro.consumoUtilidades.gas && data.financeiro.consumoUtilidades.gas > 0)
        html += `<tr><td>Gás</td><td>${formatCurrency(data.financeiro.consumoUtilidades.gas)}</td></tr>`;
      if (data.financeiro.consumoUtilidades.outros && data.financeiro.consumoUtilidades.outros > 0)
        html += `<tr><td>Outros</td><td>${formatCurrency(data.financeiro.consumoUtilidades.outros)}</td></tr>`;
      html += `<tr style="background: #F0F9FF; font-weight: bold;">
        <td>Total Consumo e Utilidades</td>
        <td>${formatCurrency(data.financeiro.consumoUtilidades.total)}</td>
      </tr></table>`;
    }

    // Despesas por Categoria - Gráfico de barras
    if (data.financeiro.despesasPorCategoria && data.financeiro.despesasPorCategoria.length > 0) {
      const sortedDespesas = [...data.financeiro.despesasPorCategoria]
        .filter(d => d.valor > 0)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 8); // Limita a 8 categorias para o gráfico

      if (sortedDespesas.length > 0) {
        const labels = sortedDespesas.map(d => d.categoria);
        const values = sortedDespesas.map(d => d.valor);
        const colors = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

        const chartConfig = {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Valor (R$)',
              data: values,
              backgroundColor: colors.slice(0, labels.length),
            }]
          },
          options: {
            indexAxis: 'y',
            plugins: {
              legend: { display: false },
              title: { display: false }
            },
            scales: {
              x: {
                ticks: {
                  callback: (value: number) => 'R$ ' + (value / 1000).toFixed(0) + 'k'
                }
              }
            }
          }
        };

        const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=500&h=300&bkg=white`;

        html += `<div class="chart-container">
        <h3>Despesas por Categoria</h3>
        <div style="text-align: center; margin: 15px 0;">
          <img src="${chartUrl}" alt="Gráfico de Despesas" style="max-width: 100%; height: auto;" />
        </div></div>`;
      }
    }

    // Consumo Mensal - Gráfico de linhas
    if (data.financeiro.consumoMensal) {
      const { agua, energia, gas } = data.financeiro.consumoMensal;
      const hasConsumo = (agua?.length ?? 0) > 0 || (energia?.length ?? 0) > 0 || (gas?.length ?? 0) > 0;

      if (hasConsumo) {
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        const datasets = [];

        if (agua && agua.length > 0) {
          datasets.push({
            label: 'Água',
            data: meses.map(mes => agua.find(d => d.mes === mes)?.valor || null),
            borderColor: '#3B82F6',
            backgroundColor: '#3B82F6',
            fill: false,
            tension: 0.3
          });
        }

        if (energia && energia.length > 0) {
          datasets.push({
            label: 'Energia',
            data: meses.map(mes => energia.find(d => d.mes === mes)?.valor || null),
            borderColor: '#F59E0B',
            backgroundColor: '#F59E0B',
            fill: false,
            tension: 0.3
          });
        }

        if (gas && gas.length > 0) {
          datasets.push({
            label: 'Gás',
            data: meses.map(mes => gas.find(d => d.mes === mes)?.valor || null),
            borderColor: '#EF4444',
            backgroundColor: '#EF4444',
            fill: false,
            tension: 0.3
          });
        }

        if (datasets.length > 0) {
          const chartConfig = {
            type: 'line',
            data: {
              labels: meses,
              datasets: datasets
            },
            options: {
              plugins: {
                legend: { position: 'bottom' }
              },
              scales: {
                y: {
                  ticks: {
                    callback: (value: number) => 'R$ ' + (value / 1000).toFixed(0) + 'k'
                  }
                }
              }
            }
          };

          const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=550&h=280&bkg=white`;

          html += `<div class="chart-container">
          <h3>Consumo Mensal</h3>
          <div style="text-align: center; margin: 15px 0;">
            <img src="${chartUrl}" alt="Gráfico de Consumo Mensal" style="max-width: 100%; height: auto;" />
          </div></div>`;
        }
      }
    }

    // Inadimplência
    if (data.financeiro.inadimplencia) {
      html += `<h3>Inadimplência</h3>
      <div class="alert-box">
        <strong>Total Inadimplente:</strong> ${formatCurrency(data.financeiro.inadimplencia.totalInadimplente)}
        ${data.financeiro.inadimplencia.percentualInadimplencia ? ` (${data.financeiro.inadimplencia.percentualInadimplencia}%)` : ""}
      </div>`;

      if (data.financeiro.inadimplencia.unidadesInadimplentes?.length > 0) {
        html += `<table class="info-table">
          <tr style="background: #F8FAFC; font-weight: bold;">
            <td>Unidade</td><td>Valor</td>
          </tr>`;
        data.financeiro.inadimplencia.unidadesInadimplentes.forEach((item) => {
          html += `<tr>
            <td>${escapeHtml(item.unidade)}</td>
            <td style="color: #DC2626;">${formatCurrency(item.valorDevido)}</td>
          </tr>`;
        });
        html += `</table>`;
      }
    }

    html += `</div>`;
  }

  // CERTIDÕES
  if (data.certidoes && data.certidoes.certidoes?.length > 0) {
    html += `<div class="section page-break">
      <h2>4. CERTIDÕES E REGULARIDADE</h2>`;

    data.certidoes.certidoes.forEach((cert) => {
      const isPositiva = cert.situacao === "positiva";
      html += `<div class="cert-item">
      <table class="info-table">
        <tr><td>Tipo</td><td>${escapeHtml(cert.tipo)}</td></tr>
        <tr><td>Situação</td><td style="${isPositiva ? "color: #DC2626; font-weight: bold;" : ""}">${cert.situacao ? cert.situacao.charAt(0).toUpperCase() + cert.situacao.slice(1) : ""}</td></tr>`;
      if (cert.dataValidade) html += `<tr><td>Validade</td><td>${escapeHtml(cert.dataValidade)}</td></tr>`;
      if (cert.observacao) html += `<tr><td>Observação</td><td style="color: #D97706; font-style: italic;">${escapeHtml(cert.observacao)}</td></tr>`;
      html += `</table></div>`;
    });

    html += `</div>`;
  }

  // DEPARTAMENTO PESSOAL
  if (data.departamentoPessoal) {
    html += `<div class="section page-break">
      <h2>5. DEPARTAMENTO PESSOAL</h2>`;

    html += `<div class="${data.departamentoPessoal.possuiFuncionariosProprios ? "highlight-box" : ""}">
      ${data.departamentoPessoal.possuiFuncionariosProprios ? "O condomínio possui funcionários próprios." : "O condomínio não possui funcionários próprios."}
    </div>`;

    if (data.departamentoPessoal.funcionarios?.length > 0) {
      html += `<h3>Quadro de Funcionários</h3>
      <table class="info-table">
        <tr style="background: #F8FAFC; font-weight: bold;">
          <td>Nome</td><td>Cargo</td><td>Salário</td><td>Horas Extras</td>
        </tr>`;

      data.departamentoPessoal.funcionarios.forEach((func) => {
        html += `<tr>
          <td>${escapeHtml(func.nome)}</td>
          <td>${func.cargo ? escapeHtml(func.cargo) : "-"}</td>
          <td>${formatCurrency(func.salario)}</td>
          <td>${func.horasExtras > 0 ? func.horasExtras + "h" : "-"}</td>
        </tr>`;
      });

      html += `</table>`;
    }

    if (data.departamentoPessoal.custoTotalFolha > 0) {
      html += `<div class="highlight-box">
        <strong>Custo Total da Folha:</strong> ${formatCurrency(data.departamentoPessoal.custoTotalFolha)}
      </div>`;
    }

    html += `</div>`;
  }

  // JURÍDICO
  if (data.juridico) {
    html += `<div class="section page-break">
      <h2>6. SITUAÇÃO JURÍDICA</h2>`;

    if (data.juridico.processos?.length > 0) {
      html += `<div class="alert-box">
        <strong>Atenção:</strong> Foram identificados ${data.juridico.processos.length} processo(s) jurídico(s).
      </div>`;

      data.juridico.processos.forEach((proc, i) => {
        html += `<div class="processo-item">
        <h3>Processo ${i + 1}</h3>
        <table class="info-table">`;
        if (proc.identificacao) html += `<tr><td>Número</td><td>${escapeHtml(proc.identificacao)}</td></tr>`;
        if (proc.tipo) html += `<tr><td>Tipo</td><td>${escapeHtml(proc.tipo)}</td></tr>`;
        if (proc.parteContraria) html += `<tr><td>Parte Contrária</td><td>${escapeHtml(proc.parteContraria)}</td></tr>`;
        if (proc.descricao) html += `<tr><td>Descrição</td><td>${escapeHtml(proc.descricao)}</td></tr>`;
        if (proc.status) html += `<tr><td>Status</td><td>${escapeHtml(proc.status)}</td></tr>`;
        if (proc.valorCausa) html += `<tr><td>Valor da Causa</td><td>${formatCurrency(proc.valorCausa)}</td></tr>`;
        if (proc.observacao) html += `<tr><td>Observação</td><td>${escapeHtml(proc.observacao)}</td></tr>`;
        html += `</table></div>`;
      });
    } else {
      html += `<div class="success-box">
        Nenhum processo judicial identificado.
      </div>`;
    }

    html += `</div>`;
  }

  // OUTROS DOCUMENTOS
  if (data.outros && data.outros.documentos?.length > 0) {
    html += `<div class="section page-break">
      <h2>7. OUTROS DOCUMENTOS</h2>`;

    data.outros.documentos.forEach((doc, index) => {
      html += `<div class="avoid-break" style="margin-bottom: 15px;">
        <h3>${escapeHtml(doc.tipoDocumento || `Documento ${index + 1}`)}</h3>`;

      if (doc.titulo) {
        html += `<p style="font-weight: bold; color: #1E3A8A; margin-bottom: 8px;">${escapeHtml(doc.titulo)}</p>`;
      }

      if (doc.resumo) {
        html += `<div class="highlight-box">${escapeHtml(doc.resumo)}</div>`;
      }

      if (doc.itensImportantes?.length > 0) {
        html += `<p style="font-size: 10pt; color: #666; margin: 10px 0 5px 0;"><strong>Itens Importantes:</strong></p>`;
        doc.itensImportantes.forEach((item) => {
          html += `<div class="list-item">${escapeHtml(item)}</div>`;
        });
      }

      if (doc.observacoes) {
        html += `<div class="alert-box" style="background: #FFFBEB; border-left-color: #D97706;">
          <strong>Observação:</strong> ${escapeHtml(doc.observacoes)}
        </div>`;
      }

      html += `</div>`;
    });

    html += `</div>`;
  }

  // Footer
  html += `
  <div class="footer">
    <div>Relatório gerado pelo Sistema Boas Vindas BAP</div>
    <div class="brand">BAP Condomínios e Imóveis</div>
  </div>
</body>
</html>`;

  return html;
}
