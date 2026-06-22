# Caderno de Produção — Mapas e Gabaritos A4

App web para montar **mapas de instalação** (foto 3D do estande com marcadores
A, B, C…) e **gabaritos técnicos** de impressão (medidas, sangria e áreas de
interferência/corte), exportando tudo em um único **PDF A4**.

## Rodando localmente

```bash
npm install
npm run dev
```

O Vite sobe em `http://localhost:5173`.

Para gerar a versão de produção:

```bash
npm run build      # gera a pasta dist/
npm run preview    # serve a build localmente
```

## Deploy (GitHub Pages)

O deploy é automático via GitHub Actions (`.github/workflows/deploy.yml`) a cada
push em `main` ou na branch de trabalho.

> **Antes do primeiro deploy**, ative o Pages no repositório:
> **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Depois disso o app fica disponível em:
`https://<usuario>.github.io/arte_guide/`

> O caminho `/arte_guide/` está fixado em `vite.config.js` (`base`). Se o nome do
> repositório mudar, ajuste o `base` para combinar.

## Estrutura

```
src/
  components/
    ProjectCover.jsx   # capa / referência visual com marcadores
    ArtPreview.jsx     # gabarito técnico A4 (SVG com sangria e cortes)
  hooks/
    useLocalStorage.js # persistência automática do estado
  utils/
    units.js           # conversões m/cm/mm e formatação
    labels.js          # rótulos A, B … Z, AA, AB
    pdf.js             # geração do PDF (html2canvas + jsPDF)
  constants.js         # cores, dimensões e parâmetros geométricos
  App.jsx              # orquestração e UI
```

## Tecnologias

React + Vite + Tailwind CSS, com `jspdf` e `html2canvas` para o PDF e
`lucide-react` para ícones.
