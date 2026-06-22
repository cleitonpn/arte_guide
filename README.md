# Caderno de Produção — Mapas e Gabaritos A4

App web para montar **mapas de instalação** (foto 3D do estande com marcadores
A, B, C…) e **gabaritos técnicos** de impressão (medidas, sangria e áreas de
interferência/corte), exportando tudo em um único **PDF A4**.

## Rodando localmente

```bash
npm install
npm run dev      # sobe em http://localhost:5173
npm run lint     # ESLint
npm test         # testes (Vitest)
```

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

## Funcionalidades

- **Mapa de instalação**: várias vistas 3D, marcadores clicáveis (A, B … Z, AA…).
- **Gabaritos A4**: medidas, sangria e áreas de interferência (retângulo/chanfro)
  com posicionamento exato por coordenadas.
- **Lista de peças**: salvar, **editar**, **duplicar** e remover.
- **Resumo de produção**: contagem de peças e área total em m².
- **Consistência marcador ↔ gabarito**: avisa marcadores na foto sem gabarito
  (e o inverso) e sugere chips de marcadores ao preencher a peça.
- **Exportar/Importar projeto** em `.json` (leva fotos e peças juntas).
- **Persistência automática** — formulário no `localStorage`, imagens no
  `IndexedDB` (não estoura a cota do navegador).
- **PDF** combinando capas + gabaritos, com indicador de progresso.

## Estrutura

```
src/
  components/
    ProjectCover.jsx     # capa / referência visual com marcadores
    ArtPreview.jsx       # gabarito técnico A4 (SVG com sangria e cortes)
  hooks/
    useLocalStorage.js   # persistência do formulário
    useIndexedDbState.js # persistência das imagens (IndexedDB)
  utils/
    units.js             # conversões m/cm/mm, formatação e área (m²)
    labels.js            # rótulos A, B … Z, AA, AB
    markers.js           # consistência marcador ↔ gabarito
    idb.js               # wrapper key-value sobre IndexedDB
    pdf.js               # geração do PDF (html2canvas + jsPDF, sob demanda)
    *.test.js            # testes (Vitest)
  constants.js           # cores, dimensões e parâmetros geométricos
  App.jsx                # orquestração e UI
```

## Tecnologias

React + Vite + Tailwind CSS, com `jspdf` e `html2canvas` para o PDF e
`lucide-react` para ícones.
