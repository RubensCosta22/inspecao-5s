// helpers.js — Funções utilitárias
import { AREAS, QUESTIONARIO } from './config.js';

export const calculateScore = (respostas) => {
  let totalAplicavel = 0;
  let somaPontos = 0;

  QUESTIONARIO.forEach(bloco => {
    bloco.perguntas.forEach(p => {
      const resp = respostas[p.id];
      if (resp && resp.valor !== 'na') {
        totalAplicavel++;
        if (resp.valor === 'atende') somaPontos += 1;
        if (resp.valor === 'parcial') somaPontos += 0.5;
      }
    });
  });

  return totalAplicavel > 0 ? Math.round((somaPontos / totalAplicavel) * 100) : 0;
};

export const calculateSenseScores = (respostas) => {
  const scores = {};

  QUESTIONARIO.forEach(bloco => {
    let totalAplicavel = 0;
    let somaPontos = 0;

    bloco.perguntas.forEach(p => {
      const resp = respostas[p.id];
      if (resp && resp.valor !== 'na') {
        totalAplicavel++;
        if (resp.valor === 'atende') somaPontos += 1;
        if (resp.valor === 'parcial') somaPontos += 0.5;
      }
    });

    scores[bloco.key] = totalAplicavel > 0 ? Math.round((somaPontos / totalAplicavel) * 100) : 0;
  });

  return scores;
};

export const getAreaFromLocal = (localName) => {
  for (const [area, locais] of Object.entries(AREAS)) {
    if (locais.includes(localName)) return area;
  }
  return 'Outros';
};

export const scoreColor = (score, hasData = true) => {
  if (!hasData) return 'text-slate-300';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const scoreBg = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const scoreBadge = (score) => {
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

export const formatDate = (dateStr) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
