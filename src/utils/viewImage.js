// Desenha os marcadores (A, B, C...) sobre a imagem da vista e devolve um
// dataURL — usado para levar a foto do projeto "com as letras" para o print.
export function renderViewWithMarkers(view) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const r = Math.max(16, Math.round(Math.min(w, h) * 0.028));
      (view.markers || []).forEach((m) => {
        const px = (m.x / 100) * w;
        const py = (m.y / 100) * h;

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = '#ea580c';
        ctx.fill();
        ctx.lineWidth = Math.max(2, r * 0.18);
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${Math.round(r * 1.15)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(m.label ?? ''), px, py + r * 0.06);
      });

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = reject;
    img.src = view.image;
  });
}
