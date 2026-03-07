# Inspeção 5S — PWA Offline

App de inspeção 5S com persistência local (IndexedDB), funciona 100% offline após primeira carga.

## Stack
- React 19 + Vite
- Tailwind CSS v4
- lucide-react (ícones)
- IndexedDB (persistência offline nativa do browser)
- PWA (Service Worker + manifest)

## Estrutura dos arquivos de configuração

### `src/config.js`
**Edite este arquivo** para personalizar o app:
- `APP_NAME`, `APP_SUBTITLE` — nome exibido na tela inicial
- `AREAS` — objeto com 8 áreas e seus sublocais
- `QUESTIONARIO` — perguntas dos 5 sensos
- `OPCOES_RESPOSTA` — opções de resposta

### `src/db.js`
Wrapper IndexedDB. Funções: `saveInspection`, `getAllInspections`, `deleteInspection`.

### `src/helpers.js`
Cálculo de scores e utilitários de formatação.

### `service-worker.js`
Cache-first: app funciona offline após primeira visita.

## Como rodar

```bash
npm install
npm run dev
```

## Build + deploy GitHub Pages

```bash
npm run build
npm run deploy
```

## Persistência de dados

Todas as inspeções (incluindo fotos comprimidas) são salvas no **IndexedDB** do dispositivo.
- Fotos são redimensionadas para máx. 800px e comprimidas (JPEG 75%) antes de salvar
- Dados persistem entre sessões e funcionam offline
- Para limpar os dados: DevTools → Application → IndexedDB → `inspecao5s_db`

## Adaptar para Android nativo (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
npm run build
npx cap copy
npx cap open android
```

## Regras de negócio
- Respostas **Não Atende** ou **Parcial**: foto + observação obrigatórios
- Se todos os itens atendem: ao menos 1 foto geral obrigatória
- Ações sugeridas: campo opcional
