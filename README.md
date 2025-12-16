# Sistema Boas Vindas BAP

Sistema para geração de relatórios de boas vindas para novos síndicos de condomínios. Utiliza inteligência artificial (Google Gemini) para extrair informações de documentos e gerar relatórios profissionais em PDF e Word.

## Funcionalidades

- Upload de múltiplos documentos por categoria
- Extração automática de informações via IA (Google Gemini)
- Mesclagem inteligente de dados de múltiplos documentos
- Geração de relatórios em PDF e Word
- Gráficos de despesas e consumo mensal
- Autenticação via Google OAuth (restrito a domínio @bap.com.br)

## Categorias de Documentos

1. **Convenção** - Dados do condomínio, regras de assembleia e financeiras
2. **Atas de Assembleia** - Governança, síndico, conselho, deliberações
3. **Documentos Financeiros** - Posição financeira, inadimplência, despesas
4. **Certidões** - CND Federal, FGTS, Trabalhista, etc.
5. **Departamento Pessoal** - Funcionários e folha de pagamento
6. **Jurídico** - Processos judiciais
7. **Outros** - Seguros, contratos, laudos, orçamentos

## Tecnologias

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Autenticação**: NextAuth.js com Google OAuth
- **IA**: Google Gemini API
- **Gráficos**: Recharts (tela) + QuickChart.io (PDF)
- **Geração de Documentos**: docx (Word)

## Configuração

### Pré-requisitos

- Node.js 18+
- Conta Google Cloud com OAuth configurado
- Chave API do Google Gemini

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/boas-vindas-bap.git
cd boas-vindas-bap
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

4. Edite o arquivo `.env.local` com suas credenciais:
```env
# Google OAuth (https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere_com_openssl_rand_base64_32

# Gemini API (https://aistudio.google.com/apikey)
GEMINI_API_KEY=sua_gemini_api_key
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse http://localhost:3000

## Deploy

### Vercel (Recomendado)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push

### Outras plataformas

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
boas-vindas-bap/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth
│   │   ├── extract/       # Extração via Gemini
│   │   └── generate-report/ # Geração de relatórios
│   ├── page.tsx           # Página principal
│   └── layout.tsx         # Layout global
├── components/            # Componentes React
│   ├── charts/           # Gráficos (Recharts)
│   └── sections/         # Previews por tipo de documento
├── lib/                   # Utilitários
│   ├── gemini.ts         # Cliente Gemini API
│   ├── prompts.ts        # Prompts de extração por tipo
│   ├── pdf-generator.ts  # Gerador de PDF (HTML)
│   └── report-generator.ts # Gerador Word (docx)
├── types/                 # Tipos TypeScript
└── public/               # Arquivos estáticos
    └── logo-bap.png      # Logo BAP
```

## Licença

Projeto privado - BAP Condomínios e Imóveis
