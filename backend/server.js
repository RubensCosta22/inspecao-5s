import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

// Carregamento manual do .env caso o dotenv não pegue automaticamente em alguns ambientes
try {
  const env = readFileSync(resolve('.env'), 'utf-8');
  env.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim();
  });
} catch (e) {
  // Silencioso se o arquivo não existir
}

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// --- Configuração de Prioridade de Modelos (Escalonamento 2026) ---
const MODEL_PRIORITY = [
  'gemini-3.1-flash-lite-preview', // Prioridade 1: Mais barato e eficiente
  'gemini-3-flash-preview',        // Prioridade 2: Melhor visão
  'gemini-2.5-flash'               // Prioridade 3: Estabilidade
];

// --- Monta o prompt para o Gemini ---
const buildPrompt = () => `
Você é um auditor especialista em metodologia 5S. 
Analise as fotos fornecidas de uma área de trabalho e responda APENAS com um JSON válido, 
sem texto adicional, no seguinte formato exato:

{
  "seiri_1": "atende", "seiri_2": "atende", "seiri_3": "parcial",
  "seiton_1": "atende", "seiton_2": "nao_atende", "seiton_3": "atende",
  "seiso_1": "atende", "seiso_2": "atende", "seiso_3": "atende",
  "seiso_4": "parcial", "seiso_5": "na",
  "seiketsu_1": "atende", "seiketsu_2": "atende", "seiketsu_3": "na",
  "shitsuke_1": "atende", "shitsuke_2": "parcial",
  "justificativas": {
    "seiri_2": "Exemplo",
    "seiton_2": "Exemplo",
    "seiso_4": "Exemplo",
    "shitsuke_2": "Exemplo"
  }
}
Valores permitidos: "atende", "parcial", "nao_atende", "na". 
Justifique APENAS para "parcial" e "nao_atende".
`;

// --- Endpoint principal ---
app.post('/api/analyze', async (req, res) => {
  try {
    const { photos } = req.body;

    if (!photos || !photos.geral) {
      return res.status(400).json({ error: 'Foto geral obrigatória.' });
    }

    // Monta array de partes da mensagem com as fotos
    const parts = [{ text: buildPrompt() }];

    for (const [key, base64] of Object.entries(photos)) {
      if (!base64) continue;
      const data = base64.includes(',') ? base64.split(',')[1] : base64;
      parts.push({
        inline_data: { mime_type: 'image/jpeg', data }
      });
    }

    // Função para tentar os modelos em sequência caso haja erro de cota (Rate Limit)
    const tryAnalysis = async (index = 0) => {
      const currentModel = MODEL_PRIORITY[index];
      console.log(`[Inspecto] Tentando modelo: ${currentModel}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ parts }],
            generationConfig: { 
              response_mime_type: "application/json" // Garante JSON puro
            }
          })
        }
      );

      // Se atingir o limite de cota (Erro 429) ou erro de servidor (500)
      if ((response.status === 429 || response.status >= 500) && index < MODEL_PRIORITY.length - 1) {
        console.warn(`Modelo ${currentModel} falhou/limitado. Escalando para o próximo...`);
        return tryAnalysis(index + 1);
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    };

    const result = await tryAnalysis();
    res.json(result);

  } catch (err) {
    console.error('Erro crítico no servidor:', err);
    res.status(500).json({ error: 'Erro na análise de 5S.', detail: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Servidor Inspecto rodando na porta ${PORT}`));