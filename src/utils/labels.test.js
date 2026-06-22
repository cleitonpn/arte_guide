import { describe, it, expect } from 'vitest';
import { indexToLabel } from './labels';

describe('indexToLabel', () => {
  it('mapeia os primeiros índices para A..Z', () => {
    expect(indexToLabel(0)).toBe('A');
    expect(indexToLabel(1)).toBe('B');
    expect(indexToLabel(25)).toBe('Z');
  });

  it('passa de Z para AA, AB... sem caracteres inválidos', () => {
    expect(indexToLabel(26)).toBe('AA');
    expect(indexToLabel(27)).toBe('AB');
    expect(indexToLabel(51)).toBe('AZ');
    expect(indexToLabel(52)).toBe('BA');
  });

  it('nunca gera os caracteres logo após Z na tabela ASCII', () => {
    for (let i = 0; i < 200; i++) {
      expect(indexToLabel(i)).toMatch(/^[A-Z]+$/);
    }
  });
});
