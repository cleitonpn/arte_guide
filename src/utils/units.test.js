import { describe, it, expect } from 'vitest';
import { parseNum, toCm, bleedToCm, isLandscape, formatDim, areaM2 } from './units';

describe('parseNum', () => {
  it('devolve número absoluto e nunca NaN', () => {
    expect(parseNum('5')).toBe(5);
    expect(parseNum('-5')).toBe(5);
    expect(parseNum('')).toBe(0);
    expect(parseNum(undefined)).toBe(0);
    expect(parseNum('abc')).toBe(0);
  });
});

describe('toCm', () => {
  it('converte metros para centímetros', () => {
    expect(toCm('1.5', 'm')).toBe(150);
    expect(toCm('20', 'cm')).toBe(20);
  });
});

describe('bleedToCm', () => {
  it('converte mm para cm', () => {
    expect(bleedToCm('30', 'mm')).toBe(3);
    expect(bleedToCm('3', 'cm')).toBe(3);
  });
});

describe('isLandscape', () => {
  it('é true quando a largura supera a altura', () => {
    expect(isLandscape('30', '20')).toBe(true);
    expect(isLandscape('20', '30')).toBe(false);
  });
  it('não quebra com valores vazios', () => {
    expect(isLandscape('', '')).toBe(false);
  });
});

describe('formatDim', () => {
  it('usa 2 casas em metros e 1 em centímetros', () => {
    expect(formatDim('1.5', 'm')).toBe('1.50');
    expect(formatDim('18', 'cm')).toBe('18.0');
  });
});

describe('areaM2', () => {
  it('calcula a área em m²', () => {
    expect(areaM2('100', '100', 'cm')).toBeCloseTo(1);
    expect(areaM2('2', '0.5', 'm')).toBeCloseTo(1);
  });
});
