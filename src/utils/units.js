// Converte qualquer entrada numérica em um número não-negativo seguro (nunca NaN).
export const parseNum = (value) => {
  const n = Math.abs(parseFloat(value));
  return Number.isFinite(n) ? n : 0;
};

// Converte uma medida (em 'm' ou 'cm') para centímetros.
export const toCm = (value, unit) => {
  const n = parseNum(value);
  return unit === 'm' ? n * 100 : n;
};

// Sangria pode vir em 'cm' ou 'mm'.
export const bleedToCm = (value, unit) => {
  const n = parseNum(value);
  return unit === 'cm' ? n : n / 10;
};

// Decide a orientação da peça de forma robusta (sem depender de NaN).
export const isLandscape = (widthStr, heightStr) =>
  parseNum(widthStr) > parseNum(heightStr);

// Formata uma medida para exibição (2 casas em metros, 1 em centímetros).
export const formatDim = (value, unit) =>
  parseNum(value).toFixed(unit === 'm' ? 2 : 1);

// Área da peça em metros quadrados (a partir de largura/altura na unidade dada).
export const areaM2 = (widthStr, heightStr, unit) =>
  (toCm(widthStr, unit) * toCm(heightStr, unit)) / 10000;
