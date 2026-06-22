// Normaliza uma string de marcadores ("A, B") em ['A','B'] (sem vazios, maiúsculo).
export const splitMarkers = (ref) =>
  (ref || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

// Todos os rótulos de marcadores posicionados nas fotos das vistas.
export const collectPhotoMarkers = (views) => {
  const set = new Set();
  views.forEach((v) =>
    v.markers.forEach((m) => {
      const label = (m.label || '').trim().toUpperCase();
      if (label) set.add(label);
    }),
  );
  return [...set];
};

// Todos os marcadores referenciados pelas peças (gabaritos).
export const collectArtMarkers = (arts) => {
  const set = new Set();
  arts.forEach((a) => splitMarkers(a.markerRef).forEach((m) => set.add(m)));
  return [...set];
};

// Compara fotos x peças e devolve as inconsistências.
export const diffMarkers = (views, arts) => {
  const photo = collectPhotoMarkers(views);
  const art = collectArtMarkers(arts);
  return {
    photo,
    art,
    // Marcadores na foto que ainda não têm gabarito.
    missingArt: photo.filter((m) => !art.includes(m)),
    // Gabaritos que apontam para um marcador inexistente na foto.
    missingPhoto: art.filter((m) => !photo.includes(m)),
  };
};
