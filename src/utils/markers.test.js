import { describe, it, expect } from 'vitest';
import { splitMarkers, collectPhotoMarkers, collectArtMarkers, diffMarkers } from './markers';

describe('splitMarkers', () => {
  it('separa por vírgula, normaliza e remove vazios', () => {
    expect(splitMarkers('a, b ,, c')).toEqual(['A', 'B', 'C']);
    expect(splitMarkers('')).toEqual([]);
    expect(splitMarkers(undefined)).toEqual([]);
  });
});

describe('coletas', () => {
  const views = [
    { id: '1', markers: [{ label: 'A' }, { label: 'b' }] },
    { id: '2', markers: [{ label: 'C' }] },
  ];
  const arts = [{ markerRef: 'A' }, { markerRef: 'B, D' }];

  it('coleta marcadores das fotos', () => {
    expect(collectPhotoMarkers(views).sort()).toEqual(['A', 'B', 'C']);
  });
  it('coleta marcadores das peças', () => {
    expect(collectArtMarkers(arts).sort()).toEqual(['A', 'B', 'D']);
  });
});

describe('diffMarkers', () => {
  it('aponta marcadores sem peça e peças sem foto', () => {
    const views = [{ id: '1', markers: [{ label: 'A' }, { label: 'C' }] }];
    const arts = [{ markerRef: 'A' }, { markerRef: 'D' }];
    const d = diffMarkers(views, arts);
    expect(d.missingArt).toEqual(['C']); // C está na foto mas não tem peça
    expect(d.missingPhoto).toEqual(['D']); // D é peça mas não está na foto
  });
});
