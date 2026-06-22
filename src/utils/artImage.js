// Converte um arquivo de arte (imagem ou PDF) num dataURL para usar no card.
// PDFs têm a primeira página renderizada via pdf.js (carregado sob demanda).

const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

async function pdfFirstPageToImage(file) {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2 });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  // Fundo branco para PDFs com transparência.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas.toDataURL('image/jpeg', 0.85);
}

export async function fileToCardImage(file) {
  if (file.type.startsWith('image/')) return readAsDataURL(file);
  if (file.type === 'application/pdf') return pdfFirstPageToImage(file);
  throw new Error('Formato não suportado (use imagem ou PDF).');
}
